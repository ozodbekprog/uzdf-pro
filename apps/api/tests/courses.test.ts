import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import {
  authHeader,
  createVerifiedUser,
  resetDb,
  type TestSession
} from "./helpers.js";

const app = await buildApp();

async function seedCourse(minReadSeconds = 60) {
  const course = await app.prisma.course.create({
    data: {
      slug: "test-kurs",
      title: "Test kurs",
      published: true
    }
  });

  const lesson = await app.prisma.lesson.create({
    data: {
      courseId: course.id,
      title: "Test dars",
      content: "Dars matni",
      position: 1,
      minReadSeconds
    }
  });

  return { course, lesson };
}

async function createAdmin(email = "admin@test.uz"): Promise<TestSession> {
  const session = await createVerifiedUser(app, { email });
  await app.prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ADMIN" }
  });
  return session;
}

async function createCourseAsAdmin(
  admin: TestSession,
  payload: { slug: string; title: string; published?: boolean }
) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/courses",
    headers: authHeader(admin),
    payload
  });
  expect(response.statusCode).toBe(201);
  return (response.json() as { course: { id: string; slug: string } }).course;
}

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("akademiya", () => {
  it("darsni boshlash va juda erta yakunlash 400 qaytaradi", async () => {
    const { lesson } = await seedCourse(60);
    const pilot = await createVerifiedUser(app, { email: "oquvchi1@test.uz" });

    const start = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lesson.id}/start`,
      headers: authHeader(pilot)
    });
    expect(start.statusCode).toBe(200);

    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lesson.id}/complete`,
      headers: authHeader(pilot)
    });
    expect(complete.statusCode).toBe(400);
    const body = complete.json() as { error: { details: { secondsRemaining: number } } };
    expect(body.error.details.secondsRemaining).toBeGreaterThan(0);
  });

  it("vaqt o'tgach yakunlanadi va EXP beriladi", async () => {
    const { lesson } = await seedCourse(60);
    const pilot = await createVerifiedUser(app, { email: "oquvchi2@test.uz" });

    await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lesson.id}/start`,
      headers: authHeader(pilot)
    });

    await app.prisma.lessonProgress.update({
      where: { userId_lessonId: { userId: pilot.user.id, lessonId: lesson.id } },
      data: { startedAt: new Date(Date.now() - 61_000) }
    });

    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lesson.id}/complete`,
      headers: authHeader(pilot)
    });
    expect(complete.statusCode).toBe(200);
    const body = complete.json() as { expAwarded: number; totalExp: number };
    expect(body.expAwarded).toBe(10);
    expect(body.totalExp).toBe(10);

    const progress = await app.inject({
      method: "GET",
      url: "/api/v1/courses/me/progress",
      headers: authHeader(pilot)
    });
    expect(progress.statusCode).toBe(200);
    const progressBody = progress.json() as { progress: Array<{ completedAt: string | null }> };
    expect(progressBody.progress).toHaveLength(1);
    expect(progressBody.progress[0]?.completedAt).toBeTruthy();
  });

  it("kursni boshlashdan oldin yakunlash 400 qaytaradi", async () => {
    const { lesson } = await seedCourse(60);
    const pilot = await createVerifiedUser(app, { email: "oquvchi3@test.uz" });

    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lesson.id}/complete`,
      headers: authHeader(pilot)
    });
    expect(complete.statusCode).toBe(400);
  });

  it("ochiq kurslar ro'yxatida nashr qilingan kurs ko'rinadi", async () => {
    await seedCourse(60);

    const list = await app.inject({ method: "GET", url: "/api/v1/courses" });
    expect(list.statusCode).toBe(200);
    const body = list.json() as { courses: Array<{ slug: string; lessonsCount: number }> };
    expect(body.courses).toHaveLength(1);
    expect(body.courses[0]?.slug).toBe("test-kurs");
    expect(body.courses[0]?.lessonsCount).toBe(1);
  });

  it("admin kurs va dars yaratadi, ochiq ro'yxatda lessonsCount ko'rinadi", async () => {
    const admin = await createAdmin("admin1@test.uz");
    const course = await createCourseAsAdmin(admin, {
      slug: "yangi-kurs",
      title: "Yangi kurs",
      published: true
    });

    const lessonResponse = await app.inject({
      method: "POST",
      url: `/api/v1/courses/${course.id}/lessons`,
      headers: authHeader(admin),
      payload: {
        title: "Yangi dars",
        content: "Dars matni",
        position: 1,
        videoUrl: "https://example.com/video.mp4"
      }
    });
    expect(lessonResponse.statusCode).toBe(201);
    const lessonBody = lessonResponse.json() as {
      lesson: { title: string; position: number; minReadSeconds: number; videoUrl: string };
    };
    expect(lessonBody.lesson.title).toBe("Yangi dars");
    expect(lessonBody.lesson.minReadSeconds).toBe(60);
    expect(lessonBody.lesson.videoUrl).toBe("https://example.com/video.mp4");

    const list = await app.inject({ method: "GET", url: "/api/v1/courses" });
    expect(list.statusCode).toBe(200);
    const body = list.json() as { courses: Array<{ slug: string; lessonsCount: number }> };
    expect(body.courses).toHaveLength(1);
    expect(body.courses[0]?.slug).toBe("yangi-kurs");
    expect(body.courses[0]?.lessonsCount).toBe(1);
  });

  it("admin darsni tahrirlaydi", async () => {
    const admin = await createAdmin("admin2@test.uz");
    const course = await createCourseAsAdmin(admin, {
      slug: "patch-kurs",
      title: "Patch kurs"
    });

    const lessonResponse = await app.inject({
      method: "POST",
      url: `/api/v1/courses/${course.id}/lessons`,
      headers: authHeader(admin),
      payload: { title: "Eski sarlavha", content: "Matn", position: 1 }
    });
    const lesson = (lessonResponse.json() as { lesson: { id: string } }).lesson;

    const patch = await app.inject({
      method: "PATCH",
      url: `/api/v1/courses/lessons/${lesson.id}`,
      headers: authHeader(admin),
      payload: { title: "Yangi sarlavha", minReadSeconds: 30 }
    });
    expect(patch.statusCode).toBe(200);
    const patched = patch.json() as { lesson: { title: string; minReadSeconds: number } };
    expect(patched.lesson.title).toBe("Yangi sarlavha");
    expect(patched.lesson.minReadSeconds).toBe(30);
  });

  it("admin darsni o'chiradi", async () => {
    const admin = await createAdmin("admin3@test.uz");
    const course = await createCourseAsAdmin(admin, {
      slug: "delete-kurs",
      title: "Delete kurs"
    });

    const lessonResponse = await app.inject({
      method: "POST",
      url: `/api/v1/courses/${course.id}/lessons`,
      headers: authHeader(admin),
      payload: { title: "O'chiriladigan dars", content: "Matn", position: 1 }
    });
    const lesson = (lessonResponse.json() as { lesson: { id: string } }).lesson;

    const remove = await app.inject({
      method: "DELETE",
      url: `/api/v1/courses/lessons/${lesson.id}`,
      headers: authHeader(admin)
    });
    expect(remove.statusCode).toBe(200);
    const body = remove.json() as { ok: boolean; message: string };
    expect(body.ok).toBe(true);

    const gone = await app.prisma.lesson.findUnique({ where: { id: lesson.id } });
    expect(gone).toBeNull();
  });

  it("PILOT kurs yaratishda 403 oladi", async () => {
    const pilot = await createVerifiedUser(app, { email: "pilot-403@test.uz" });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/courses",
      headers: authHeader(pilot),
      payload: { slug: "ruxsatsiz-kurs", title: "Ruxsatsiz kurs" }
    });
    expect(response.statusCode).toBe(403);
  });

  it("takroriy slug 409 qaytaradi", async () => {
    const admin = await createAdmin("admin4@test.uz");
    await createCourseAsAdmin(admin, { slug: "takroriy-kurs", title: "Takroriy kurs" });

    const duplicate = await app.inject({
      method: "POST",
      url: "/api/v1/courses",
      headers: authHeader(admin),
      payload: { slug: "takroriy-kurs", title: "Yana bir kurs" }
    });
    expect(duplicate.statusCode).toBe(409);
    const body = duplicate.json() as { error: { code: string } };
    expect(body.error.code).toBe("CONFLICT");
  });

  it("takroriy pozitsiyali dars 409 qaytaradi", async () => {
    const admin = await createAdmin("admin5@test.uz");
    const course = await createCourseAsAdmin(admin, {
      slug: "pozitsiya-kurs",
      title: "Pozitsiya kurs"
    });

    await app.inject({
      method: "POST",
      url: `/api/v1/courses/${course.id}/lessons`,
      headers: authHeader(admin),
      payload: { title: "1-dars", content: "Matn", position: 1 }
    });

    const duplicate = await app.inject({
      method: "POST",
      url: `/api/v1/courses/${course.id}/lessons`,
      headers: authHeader(admin),
      payload: { title: "Takroriy dars", content: "Matn", position: 1 }
    });
    expect(duplicate.statusCode).toBe(409);
  });
});
