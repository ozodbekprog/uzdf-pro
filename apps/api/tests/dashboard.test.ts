import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { authHeader, createVerifiedUser, resetDb } from "./helpers.js";

const app = await buildApp();

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("dashboard", () => {
  it("yangi foydalanuvchi statistikasi nolga teng", async () => {
    const session = await createVerifiedUser(app, { email: "dash-fresh@test.uz" });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/dashboard/me",
      headers: authHeader(session)
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      ok: boolean;
      stats: {
        exp: number;
        level: number;
        completedLessons: number;
        certificates: number;
        ratingPosition: number;
      };
      courses: unknown[];
    };
    expect(body.ok).toBe(true);
    expect(body.stats).toEqual({
      exp: 0,
      level: 1,
      completedLessons: 0,
      certificates: 0,
      ratingPosition: 1
    });
    expect(body.courses).toEqual([]);
  });

  it("foiz va keyingi darsni hisoblaydi", async () => {
    const session = await createVerifiedUser(app, { email: "dash-progress@test.uz" });

    const course = await app.prisma.course.create({
      data: { slug: "dash-kurs", title: "Dashboard kurs", published: true }
    });
    const first = await app.prisma.lesson.create({
      data: { courseId: course.id, title: "Birinchi dars", content: "Matn", position: 1 }
    });
    const second = await app.prisma.lesson.create({
      data: { courseId: course.id, title: "Ikkinchi dars", content: "Matn", position: 2 }
    });

    const startedAt = new Date(Date.now() - 60 * 60 * 1000);
    await app.prisma.lessonProgress.create({
      data: {
        userId: session.user.id,
        lessonId: first.id,
        startedAt,
        completedAt: new Date()
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/dashboard/me",
      headers: authHeader(session)
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      stats: { completedLessons: number };
      courses: Array<{
        id: string;
        slug: string;
        title: string;
        lessonsCount: number;
        completedCount: number;
        percent: number;
        nextLessonId: string | null;
        nextLessonTitle: string | null;
        lastActivityAt: string | null;
      }>;
    };
    expect(body.stats.completedLessons).toBe(1);
    expect(body.courses).toHaveLength(1);
    const item = body.courses[0]!;
    expect(item.id).toBe(course.id);
    expect(item.slug).toBe("dash-kurs");
    expect(item.lessonsCount).toBe(2);
    expect(item.completedCount).toBe(1);
    expect(item.percent).toBe(50);
    expect(item.nextLessonId).toBe(second.id);
    expect(item.nextLessonTitle).toBe("Ikkinchi dars");
    expect(item.lastActivityAt).toBe(startedAt.toISOString());
  });

  it("reytingni EXP bo'yicha tartiblaydi", async () => {
    const first = await createVerifiedUser(app, { email: "rating-1@test.uz" });
    const second = await createVerifiedUser(app, { email: "rating-2@test.uz" });
    const third = await createVerifiedUser(app, { email: "rating-3@test.uz" });

    await app.prisma.user.update({ where: { id: first.user.id }, data: { exp: 250 } });
    await app.prisma.user.update({ where: { id: second.user.id }, data: { exp: 100 } });
    await app.prisma.user.update({ where: { id: third.user.id }, data: { exp: 0 } });

    const response = await app.inject({ method: "GET", url: "/api/v1/dashboard/rating?limit=10" });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      ok: boolean;
      users: Array<{ position: number; id: string; fullName: string; exp: number; level: number }>;
    };
    expect(body.ok).toBe(true);
    expect(body.users.map((user) => user.position)).toEqual([1, 2, 3]);
    expect(body.users.map((user) => user.exp)).toEqual([250, 100, 0]);
    expect(body.users.map((user) => user.level)).toEqual([3, 2, 1]);
    expect(body.users.map((user) => user.id)).toEqual([
      first.user.id,
      second.user.id,
      third.user.id
    ]);
  });

  it("token bo'lmasa 401 qaytaradi", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/dashboard/me" });
    expect(response.statusCode).toBe(401);
  });
});
