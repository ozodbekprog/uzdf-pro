import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import {
  authHeader,
  createVerifiedUser,
  resetDb,
  type TestSession
} from "./helpers.js";

const app = await buildApp();

const COURSE_SLUG = "sertifikat-kurs";
const COURSE_TITLE = "Sertifikat kursi";
const COURSE_DESCRIPTION = "Sertifikat oqimi uchun kurs";

async function seedCourse(lessonCount: number) {
  const course = await app.prisma.course.create({
    data: {
      slug: COURSE_SLUG,
      title: COURSE_TITLE,
      description: COURSE_DESCRIPTION,
      published: true
    }
  });

  const lessons = [];

  for (let position = 1; position <= lessonCount; position += 1) {
    lessons.push(
      await app.prisma.lesson.create({
        data: {
          courseId: course.id,
          title: `Dars ${position}`,
          content: `Dars ${position} matni`,
          position,
          minReadSeconds: 1
        }
      })
    );
  }

  return { course, lessons };
}

async function completeLesson(session: TestSession, lessonId: string) {
  const start = await app.inject({
    method: "POST",
    url: `/api/v1/courses/lessons/${lessonId}/start`,
    headers: authHeader(session)
  });
  expect(start.statusCode).toBe(200);

  await app.prisma.lessonProgress.update({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    data: { startedAt: new Date(Date.now() - 5_000) }
  });

  return app.inject({
    method: "POST",
    url: `/api/v1/courses/lessons/${lessonId}/complete`,
    headers: authHeader(session)
  });
}

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("sertifikatlar", () => {
  it("barcha darslar yakunlanganda sertifikat beriladi va ro'yxatda ko'rinadi", async () => {
    const { lessons } = await seedCourse(2);
    const pilot = await createVerifiedUser(app, {
      email: "cert-1@test.uz",
      fullName: "Uchuvchi Bir"
    });

    let lastBody: { certificateIssued?: boolean; certificateCode?: string } = {};

    for (const [index, lesson] of lessons.entries()) {
      const response = await completeLesson(pilot, lesson.id);
      expect(response.statusCode).toBe(200);
      lastBody = response.json();

      if (index < lessons.length - 1) {
        expect(lastBody.certificateIssued).toBe(false);
        expect(lastBody.certificateCode).toBeUndefined();
      }
    }

    expect(lastBody.certificateIssued).toBe(true);
    expect(lastBody.certificateCode).toMatch(/^UZDF-[0-9A-F]{8}$/);

    const repeat = await completeLesson(pilot, lessons[lessons.length - 1]!.id);
    expect(repeat.statusCode).toBe(200);
    const repeatBody = repeat.json() as {
      alreadyCompleted?: boolean;
      certificateIssued?: boolean;
    };
    expect(repeatBody.alreadyCompleted).toBe(true);
    expect(repeatBody.certificateIssued).toBe(false);

    const stored = await app.prisma.certificate.findMany({ where: { userId: pilot.user.id } });
    expect(stored).toHaveLength(1);

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/certificates/me",
      headers: authHeader(pilot)
    });
    expect(me.statusCode).toBe(200);
    const body = me.json() as {
      ok: boolean;
      certificates: Array<{
        id: string;
        code: string;
        issuedAt: string;
        course: { slug: string; title: string; description: string | null };
      }>;
    };
    expect(body.ok).toBe(true);
    expect(body.certificates).toHaveLength(1);
    expect(body.certificates[0]?.code).toBe(lastBody.certificateCode);
    expect(body.certificates[0]?.issuedAt).toBeTruthy();
    expect(body.certificates[0]?.course.slug).toBe(COURSE_SLUG);
    expect(body.certificates[0]?.course.title).toBe(COURSE_TITLE);
    expect(body.certificates[0]?.course.description).toBe(COURSE_DESCRIPTION);
  });

  it("sertifikatni kod bo'yicha tekshirish mumkin, noma'lum kod 404", async () => {
    const { lessons } = await seedCourse(1);
    const pilot = await createVerifiedUser(app, {
      email: "cert-2@test.uz",
      fullName: "Uchuvchi Ikki"
    });

    const complete = await completeLesson(pilot, lessons[0]!.id);
    expect(complete.statusCode).toBe(200);
    const code = (complete.json() as { certificateCode: string }).certificateCode;

    const verify = await app.inject({
      method: "GET",
      url: `/api/v1/certificates/verify/${code}`
    });
    expect(verify.statusCode).toBe(200);
    const body = verify.json() as {
      ok: boolean;
      valid: boolean;
      certificate: {
        code: string;
        issuedAt: string;
        user: { fullName: string };
        course: { slug: string; title: string };
      };
    };
    expect(body.ok).toBe(true);
    expect(body.valid).toBe(true);
    expect(body.certificate.code).toBe(code);
    expect(body.certificate.user.fullName).toBe("Uchuvchi Ikki");
    expect(body.certificate.course.slug).toBe(COURSE_SLUG);
    expect(body.certificate.course.title).toBe(COURSE_TITLE);

    const lowercase = await app.inject({
      method: "GET",
      url: `/api/v1/certificates/verify/${code.toLowerCase()}`
    });
    expect(lowercase.statusCode).toBe(200);

    const unknown = await app.inject({
      method: "GET",
      url: "/api/v1/certificates/verify/UZDF-XXXXXXXX"
    });
    expect(unknown.statusCode).toBe(404);
    const unknownBody = unknown.json() as { error: { code: string } };
    expect(unknownBody.error.code).toBe("NOT_FOUND");
  });

  it("kurs qisman yakunlansa sertifikat berilmaydi", async () => {
    const { lessons } = await seedCourse(2);
    const pilot = await createVerifiedUser(app, { email: "cert-3@test.uz" });

    const complete = await completeLesson(pilot, lessons[0]!.id);
    expect(complete.statusCode).toBe(200);
    expect((complete.json() as { certificateIssued: boolean }).certificateIssued).toBe(false);

    const stored = await app.prisma.certificate.count({ where: { userId: pilot.user.id } });
    expect(stored).toBe(0);

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/certificates/me",
      headers: authHeader(pilot)
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as { certificates: unknown[] }).certificates).toHaveLength(0);
  });

  it("sertifikatlar ro'yxati token talab qiladi", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/certificates/me"
    });
    expect(response.statusCode).toBe(401);
  });
});
