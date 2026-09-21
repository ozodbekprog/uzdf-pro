import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { authHeader, createVerifiedUser, resetDb, type TestSession } from "./helpers.js";

const app = await buildApp();

const COURSE_SLUG = "flow-kurs";
const COURSE_TITLE = "Flow kurs";
const COURSE_DESCRIPTION = "To'liq oqim uchun kurs";
const LESSON_TITLE = "Flow dars";
const LESSON_CONTENT = "Oqim darsi matni";

async function seedCourseAndLesson(
  admin: TestSession
): Promise<{ slug: string; lessonId: string }> {
  let courseId: string | undefined;
  let slug = COURSE_SLUG;

  const createdCourse = await app.inject({
    method: "POST",
    url: "/api/v1/courses",
    headers: authHeader(admin),
    payload: {
      slug: COURSE_SLUG,
      title: COURSE_TITLE,
      description: COURSE_DESCRIPTION,
      published: true
    }
  });

  if (createdCourse.statusCode >= 200 && createdCourse.statusCode < 300) {
    const body = createdCourse.json() as {
      id?: string;
      slug?: string;
      course?: { id?: string; slug?: string };
    };
    courseId = body.course?.id ?? body.id;
    slug = body.course?.slug ?? body.slug ?? slug;
  }

  if (!courseId) {
    const course = await app.prisma.course.upsert({
      where: { slug },
      create: {
        slug,
        title: COURSE_TITLE,
        description: COURSE_DESCRIPTION,
        published: true
      },
      update: {
        title: COURSE_TITLE,
        description: COURSE_DESCRIPTION,
        published: true
      }
    });
    courseId = course.id;
  }

  let lessonId: string | undefined;

  for (const url of [
    `/api/v1/courses/${courseId}/lessons`,
    `/api/v1/courses/${slug}/lessons`
  ]) {
    const createdLesson = await app.inject({
      method: "POST",
      url,
      headers: authHeader(admin),
      payload: {
        title: LESSON_TITLE,
        content: LESSON_CONTENT,
        position: 1,
        minReadSeconds: 1
      }
    });

    if (createdLesson.statusCode >= 200 && createdLesson.statusCode < 300) {
      const body = createdLesson.json() as { id?: string; lesson?: { id?: string } };
      lessonId = body.lesson?.id ?? body.id;
      if (lessonId) break;
    }
  }

  if (!lessonId) {
    const lesson = await app.prisma.lesson.upsert({
      where: { courseId_position: { courseId, position: 1 } },
      create: {
        courseId,
        title: LESSON_TITLE,
        content: LESSON_CONTENT,
        position: 1,
        minReadSeconds: 1
      },
      update: {
        title: LESSON_TITLE,
        content: LESSON_CONTENT,
        minReadSeconds: 1
      }
    });
    lessonId = lesson.id;
  }

  return { slug, lessonId };
}

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("to'liq foydalanuvchi oqimi", () => {
  it("to'liq oqim: ro'yxat -> dars -> EXP", async () => {
    const session = await createVerifiedUser(app, { email: "flow@test.uz" });

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: authHeader(session)
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as { user: { email: string } }).user.email).toBe("flow@test.uz");

    const zones = await app.inject({ method: "GET", url: "/api/v1/zones" });
    expect(zones.statusCode).toBe(200);
    expect((zones.json() as { ok: boolean }).ok).toBe(true);

    await app.prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" }
    });

    const { slug, lessonId } = await seedCourseAndLesson(session);
    expect(lessonId).toBeTruthy();

    const list = await app.inject({ method: "GET", url: "/api/v1/courses" });
    expect(list.statusCode).toBe(200);
    const listBody = list.json() as { courses: Array<{ slug: string }> };
    expect(listBody.courses.some((course) => course.slug === slug)).toBe(true);

    const detail = await app.inject({ method: "GET", url: `/api/v1/courses/${slug}` });
    expect(detail.statusCode).toBe(200);
    const detailBody = detail.json() as { course: { lessons: Array<{ id: string }> } };
    expect(detailBody.course.lessons.some((lesson) => lesson.id === lessonId)).toBe(true);

    const start = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lessonId}/start`,
      headers: authHeader(session)
    });
    expect(start.statusCode).toBe(200);

    await app.prisma.lessonProgress.update({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      data: { startedAt: new Date(Date.now() - 5000) }
    });

    const complete = await app.inject({
      method: "POST",
      url: `/api/v1/courses/lessons/${lessonId}/complete`,
      headers: authHeader(session)
    });
    expect(complete.statusCode).toBe(200);
    const completeBody = complete.json() as { expAwarded: number; totalExp: number };
    expect(completeBody.expAwarded).toBe(10);
    expect(completeBody.totalExp).toBe(10);

    const progress = await app.inject({
      method: "GET",
      url: "/api/v1/courses/me/progress",
      headers: authHeader(session)
    });
    expect(progress.statusCode).toBe(200);
    const progressBody = progress.json() as {
      progress: Array<{ lessonId: string; completedAt: string | null }>;
    };
    expect(progressBody.progress).toHaveLength(1);
    expect(progressBody.progress[0]?.lessonId).toBe(lessonId);
    expect(progressBody.progress[0]?.completedAt).not.toBeNull();

    const health = await app.inject({ method: "GET", url: "/health/db" });
    expect(health.statusCode).toBe(200);
    expect((health.json() as { ok: boolean }).ok).toBe(true);
  });

  it("token rotatsiyasi va logout", async () => {
    const session = await createVerifiedUser(app, { email: "flow-rotate@test.uz" });

    const refreshed = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: session.refreshToken }
    });
    expect(refreshed.statusCode).toBe(200);
    const refreshedBody = refreshed.json() as { refreshToken: string };
    expect(refreshedBody.refreshToken).not.toBe(session.refreshToken);

    const reuse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: session.refreshToken }
    });
    expect(reuse.statusCode).toBe(401);

    const logout = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: { refreshToken: refreshedBody.refreshToken }
    });
    expect(logout.statusCode).toBe(200);

    const afterLogout = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: refreshedBody.refreshToken }
    });
    expect(afterLogout.statusCode).toBe(401);
  });

  it("zona tekshiruvi oqimi", async () => {
    const admin = await createVerifiedUser(app, { email: "flow-zone@test.uz" });
    await app.prisma.user.update({
      where: { id: admin.user.id },
      data: { role: "ADMIN" }
    });

    const create = await app.inject({
      method: "POST",
      url: "/api/v1/zones",
      headers: authHeader(admin),
      payload: {
        name: "Flow RED zona",
        type: "RED",
        description: "Oqim testi uchun zona",
        polygon: [
          [41.3, 69.2],
          [41.3, 69.3],
          [41.2, 69.3],
          [41.2, 69.2]
        ]
      }
    });
    expect(create.statusCode).toBe(201);

    const inside = await app.inject({
      method: "POST",
      url: "/api/v1/zones/check",
      payload: { lat: 41.25, lng: 69.25 }
    });
    expect(inside.statusCode).toBe(200);
    expect((inside.json() as { status: string }).status).toBe("RED");

    const outside = await app.inject({
      method: "POST",
      url: "/api/v1/zones/check",
      payload: { lat: 40, lng: 70 }
    });
    expect(outside.statusCode).toBe(200);
    expect((outside.json() as { status: string }).status).toBe("CLEAR");
  });
});
