import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, conflict, notFound } from "../lib/errors.js";
import { issueCertificate } from "./certificates.js";

const lessonParamsSchema = z.object({ lessonId: z.string().uuid() });
const courseParamsSchema = z.object({ id: z.string().uuid() });

const courseBodySchema = z.object({
  slug: z.string().trim().min(2),
  title: z.string().trim().min(2),
  description: z.string().optional(),
  published: z.boolean().optional()
});

const coursePatchSchema = courseBodySchema.partial();

const lessonBodySchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  videoUrl: z.string().url().nullable().optional(),
  position: z.number().int().min(1),
  minReadSeconds: z.number().int().min(0).default(60)
});

const lessonPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().min(1).optional(),
  videoUrl: z.string().url().nullable().optional(),
  position: z.number().int().min(1).optional(),
  minReadSeconds: z.number().int().min(0).optional()
});

const COMPLETE_EXP = 10;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function courseRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      schema: { tags: ["courses"], summary: "Nashr qilingan kurslar ro'yxati (ochiq)" }
    },
    async () => {
      const courses = await app.prisma.course.findMany({
        where: { published: true },
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { lessons: true } } }
      });

      return {
        ok: true,
        count: courses.length,
        courses: courses.map((course) => ({
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          lessonsCount: course._count.lessons
        }))
      };
    }
  );

  app.get(
    "/me/progress",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["courses"], summary: "Mening o'quv progressim" }
    },
    async (request) => {
      const progress = await app.prisma.lessonProgress.findMany({
        where: { userId: request.currentUser!.id },
        orderBy: { startedAt: "desc" },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              position: true,
              minReadSeconds: true,
              course: { select: { slug: true, title: true } }
            }
          }
        }
      });

      return { ok: true, count: progress.length, progress };
    }
  );

  app.get(
    "/:slug",
    {
      schema: { tags: ["courses"], summary: "Kurs tafsilotlari darslari bilan" }
    },
    async (request) => {
      const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params);

      const course = await app.prisma.course.findFirst({
        where: { slug, published: true },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              content: true,
              videoUrl: true,
              position: true,
              minReadSeconds: true
            }
          }
        }
      });

      if (!course) throw notFound("Kurs topilmadi");
      return { ok: true, course };
    }
  );

  app.post(
    "/lessons/:lessonId/start",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["courses"], summary: "Darsni boshlash (taymer serverda yuradi)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);
      const userId = request.currentUser!.id;

      const lesson = await app.prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) throw notFound("Dars topilmadi");

      const progress = await app.prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: { userId, lessonId },
        update: {}
      });

      return { ok: true, progress };
    }
  );

  app.post(
    "/lessons/:lessonId/complete",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["courses"], summary: "Darsni yakunlash (anti-cheat: vaqt serverda tekshiriladi)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);
      const userId = request.currentUser!.id;

      const lesson = await app.prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) throw notFound("Dars topilmadi");

      const progress = await app.prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } }
      });
      if (!progress) throw badRequest("Avval darsni boshlang");

      if (progress.completedAt) {
        return { ok: true, alreadyCompleted: true, expAwarded: 0, certificateIssued: false };
      }

      const elapsedSeconds = Math.floor((Date.now() - progress.startedAt.getTime()) / 1000);
      if (elapsedSeconds < lesson.minReadSeconds) {
        const secondsRemaining = lesson.minReadSeconds - elapsedSeconds;
        throw badRequest(`Hali erta — yana ${secondsRemaining} soniya o'qing`, {
          secondsRemaining
        });
      }

      const [updated, user] = await app.prisma.$transaction([
        app.prisma.lessonProgress.update({
          where: { id: progress.id },
          data: { completedAt: new Date(), secondsSpent: elapsedSeconds }
        }),
        app.prisma.user.update({
          where: { id: userId },
          data: { exp: { increment: COMPLETE_EXP } }
        })
      ]);

      const [totalLessons, completedLessons] = await Promise.all([
        app.prisma.lesson.count({ where: { courseId: lesson.courseId } }),
        app.prisma.lessonProgress.count({
          where: {
            userId,
            completedAt: { not: null },
            lesson: { courseId: lesson.courseId }
          }
        })
      ]);

      let certificateIssued = false;
      let certificateCode: string | undefined;

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        const existingCertificate = await app.prisma.certificate.findUnique({
          where: { userId_courseId: { userId, courseId: lesson.courseId } }
        });

        if (!existingCertificate) {
          const certificate = await issueCertificate(app, userId, lesson.courseId);
          certificateIssued = true;
          certificateCode = certificate.code;
        }
      }

      return {
        ok: true,
        progress: updated,
        expAwarded: COMPLETE_EXP,
        totalExp: user.exp,
        certificateIssued,
        certificateCode
      };
    }
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Yangi kurs yaratish (admin+)" }
    },
    async (request, reply) => {
      const input = courseBodySchema.parse(request.body);

      try {
        const course = await app.prisma.course.create({
          data: {
            slug: input.slug,
            title: input.title,
            description: input.description,
            published: input.published ?? false
          }
        });
        return reply.status(201).send({ ok: true, course });
      } catch (error) {
        if (isUniqueConstraintError(error)) throw conflict("Bu slug allaqachon band");
        throw error;
      }
    }
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Kursni tahrirlash (admin+)" }
    },
    async (request) => {
      const { id } = courseParamsSchema.parse(request.params);
      const input = coursePatchSchema.parse(request.body);

      const existing = await app.prisma.course.findUnique({ where: { id } });
      if (!existing) throw notFound("Kurs topilmadi");

      try {
        const course = await app.prisma.course.update({ where: { id }, data: input });
        return { ok: true, course };
      } catch (error) {
        if (isUniqueConstraintError(error)) throw conflict("Bu slug allaqachon band");
        throw error;
      }
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Kursni o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = courseParamsSchema.parse(request.params);

      const existing = await app.prisma.course.findUnique({ where: { id } });
      if (!existing) throw notFound("Kurs topilmadi");

      await app.prisma.course.delete({ where: { id } });
      return { ok: true, message: "Kurs o'chirildi" };
    }
  );

  app.post(
    "/:id/lessons",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Kursga dars qo'shish (admin+)" }
    },
    async (request, reply) => {
      const { id } = courseParamsSchema.parse(request.params);
      const input = lessonBodySchema.parse(request.body);

      const course = await app.prisma.course.findUnique({ where: { id } });
      if (!course) throw notFound("Kurs topilmadi");

      try {
        const lesson = await app.prisma.lesson.create({
          data: {
            courseId: id,
            title: input.title,
            content: input.content,
            videoUrl: input.videoUrl ?? null,
            position: input.position,
            minReadSeconds: input.minReadSeconds
          }
        });
        return reply.status(201).send({ ok: true, lesson });
      } catch (error) {
        if (isUniqueConstraintError(error)) throw conflict("Bu pozitsiya band");
        throw error;
      }
    }
  );

  app.patch(
    "/lessons/:lessonId",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Darsni tahrirlash (admin+)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);
      const input = lessonPatchSchema.parse(request.body);

      const existing = await app.prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!existing) throw notFound("Dars topilmadi");

      try {
        const lesson = await app.prisma.lesson.update({ where: { id: lessonId }, data: input });
        return { ok: true, lesson };
      } catch (error) {
        if (isUniqueConstraintError(error)) throw conflict("Bu pozitsiya band");
        throw error;
      }
    }
  );

  app.delete(
    "/lessons/:lessonId",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["courses"], summary: "Darsni o'chirish (admin+)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);

      const existing = await app.prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!existing) throw notFound("Dars topilmadi");

      await app.prisma.lesson.delete({ where: { id: lessonId } });
      return { ok: true, message: "Dars o'chirildi" };
    }
  );
}
