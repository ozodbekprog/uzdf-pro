import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../lib/errors.js";

const lessonParamsSchema = z.object({ lessonId: z.string().uuid() });
const quizParamsSchema = z.object({ quizId: z.string().uuid() });

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0).max(20))
});

const QUIZ_PASS_EXP = 20;

export async function quizRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/lesson/:lessonId",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["quizzes"], summary: "Dars testi (to'g'ri javoblar berilmaydi)" }
    },
    async (request) => {
      const { lessonId } = lessonParamsSchema.parse(request.params);
      const userId = request.currentUser!.id;

      const quiz = await app.prisma.quiz.findUnique({
        where: { lessonId },
        include: { questions: { orderBy: { position: "asc" } } }
      });

      if (!quiz) throw notFound("Bu dars uchun test mavjud emas");

      const lastAttempt = await app.prisma.quizAttempt.findFirst({
        where: { quizId: quiz.id, userId },
        orderBy: { createdAt: "desc" }
      });

      return {
        ok: true,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          passScore: quiz.passScore,
          questions: quiz.questions.map((question) => ({
            id: question.id,
            text: question.text,
            options: question.options as string[]
          }))
        },
        lastAttempt: lastAttempt
          ? {
              score: lastAttempt.score,
              total: lastAttempt.total,
              passed: lastAttempt.passed,
              createdAt: lastAttempt.createdAt
            }
          : null
      };
    }
  );

  app.post(
    "/:quizId/submit",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["quizzes"], summary: "Testni topshirish (ball serverda hisoblanadi)" }
    },
    async (request) => {
      const { quizId } = quizParamsSchema.parse(request.params);
      const { answers } = submitSchema.parse(request.body);
      const userId = request.currentUser!.id;

      const quiz = await app.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { orderBy: { position: "asc" } } }
      });
      if (!quiz) throw notFound("Test topilmadi");
      if (quiz.questions.length === 0) throw badRequest("Testda savollar yo'q");
      if (answers.length !== quiz.questions.length) {
        throw badRequest(
          `Javoblar soni mos emas: ${quiz.questions.length} ta savol, ${answers.length} ta javob`
        );
      }

      let correctCount = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correct) correctCount += 1;
      });

      const total = quiz.questions.length;
      const percent = Math.round((correctCount / total) * 100);
      const passed = percent >= quiz.passScore;

      const previousPass = passed
        ? await app.prisma.quizAttempt.findFirst({
            where: { quizId, userId, passed: true }
          })
        : null;

      const attempt = await app.prisma.quizAttempt.create({
        data: { quizId, userId, score: correctCount, total, passed }
      });

      let expAwarded = 0;
      let totalExp = request.currentUser!.exp;

      if (passed && !previousPass) {
        const user = await app.prisma.user.update({
          where: { id: userId },
          data: { exp: { increment: QUIZ_PASS_EXP } }
        });
        expAwarded = QUIZ_PASS_EXP;
        totalExp = user.exp;
      }

      return {
        ok: true,
        attempt: {
          id: attempt.id,
          score: correctCount,
          total,
          percent,
          passed
        },
        expAwarded,
        totalExp
      };
    }
  );
}
