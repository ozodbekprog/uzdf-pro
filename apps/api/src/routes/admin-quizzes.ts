import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../lib/errors.js";

const lessonParamsSchema = z.object({ lessonId: z.string().uuid() });
const quizParamsSchema = z.object({ id: z.string().uuid() });

const quizBodySchema = z.object({
  title: z.string().trim().min(2).max(200),
  passScore: z.number().int().min(0).max(100).default(70),
  questions: z
    .array(
      z.object({
        text: z.string().trim().min(2).max(1000),
        options: z.array(z.string().trim().min(1).max(500)).min(2).max(10),
        correct: z.number().int().min(0)
      })
    )
    .min(1)
    .max(100)
});

export async function adminQuizRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-quizzes"], summary: "Barcha testlar dars va statistika bilan (admin+)" }
    },
    async () => {
      const quizzes = await app.prisma.quiz.findMany({
        orderBy: { createdAt: "asc" },
        take: 200,
        include: {
          lesson: {
            select: {
              title: true,
              position: true,
              course: { select: { slug: true, title: true } }
            }
          },
          questions: { orderBy: { position: "asc" } },
          _count: { select: { attempts: true } }
        }
      });

      const passedGroups = await app.prisma.quizAttempt.groupBy({
        by: ["quizId"],
        where: { passed: true },
        _count: { _all: true }
      });
      const passedByQuiz = new Map(
        passedGroups.map((group) => [group.quizId, group._count._all])
      );

      return {
        ok: true,
        count: quizzes.length,
        quizzes: quizzes.map((quiz) => ({
          id: quiz.id,
          lessonId: quiz.lessonId,
          title: quiz.title,
          passScore: quiz.passScore,
          lesson: {
            title: quiz.lesson.title,
            position: quiz.lesson.position,
            course: {
              slug: quiz.lesson.course.slug,
              title: quiz.lesson.course.title
            }
          },
          questions: quiz.questions.map((question) => ({
            id: question.id,
            text: question.text,
            options: question.options as string[],
            correct: question.correct,
            position: question.position
          })),
          attempts: quiz._count.attempts,
          passed: passedByQuiz.get(quiz.id) ?? 0
        }))
      };
    }
  );

  app.put(
    "/:lessonId",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-quizzes"], summary: "Dars uchun testni yaratish yoki yangilash (admin+)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);
      const input = quizBodySchema.parse(request.body);

      const lesson = await app.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true }
      });
      if (!lesson) throw notFound("Dars topilmadi");

      input.questions.forEach((question, index) => {
        if (question.correct >= question.options.length) {
          throw badRequest(
            `${index + 1}-savolda "correct" indeksi variantlar sonidan kichik bo'lishi kerak`
          );
        }
      });

      await app.prisma.$transaction(async (tx) => {
        const saved = await tx.quiz.upsert({
          where: { lessonId },
          create: { lessonId, title: input.title, passScore: input.passScore },
          update: { title: input.title, passScore: input.passScore }
        });

        await tx.question.deleteMany({ where: { quizId: saved.id } });
        await tx.question.createMany({
          data: input.questions.map((question, index) => ({
            quizId: saved.id,
            text: question.text,
            options: question.options,
            correct: question.correct,
            position: index + 1
          }))
        });
      });

      const quiz = await app.prisma.quiz.findUniqueOrThrow({
        where: { lessonId },
        include: {
          lesson: {
            select: {
              title: true,
              position: true,
              course: { select: { slug: true, title: true } }
            }
          },
          questions: { orderBy: { position: "asc" } },
          _count: { select: { attempts: true } }
        }
      });
      const passed = await app.prisma.quizAttempt.count({
        where: { quizId: quiz.id, passed: true }
      });

      return {
        ok: true,
        quiz: {
          id: quiz.id,
          lessonId: quiz.lessonId,
          title: quiz.title,
          passScore: quiz.passScore,
          lesson: {
            title: quiz.lesson.title,
            position: quiz.lesson.position,
            course: {
              slug: quiz.lesson.course.slug,
              title: quiz.lesson.course.title
            }
          },
          questions: quiz.questions.map((question) => ({
            id: question.id,
            text: question.text,
            options: question.options as string[],
            correct: question.correct,
            position: question.position
          })),
          attempts: quiz._count.attempts,
          passed
        }
      };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-quizzes"], summary: "Testni o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = quizParamsSchema.parse(request.params);

      const existing = await app.prisma.quiz.findUnique({
        where: { id },
        select: { id: true }
      });
      if (!existing) throw notFound("Test topilmadi");

      await app.prisma.quiz.delete({ where: { id } });
      return { ok: true, message: "Test o'chirildi" };
    }
  );
}
