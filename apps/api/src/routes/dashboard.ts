import type { FastifyInstance } from "fastify";
import { z } from "zod";

const ratingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const ratingRouteSchema = {
  tags: ["rating"],
  summary: "EXP reytingi (ochiq)"
};

function levelOf(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

async function buildRating(app: FastifyInstance, query: unknown) {
  const { limit } = ratingQuerySchema.parse(query);

  const users = await app.prisma.user.findMany({
    orderBy: [{ exp: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    take: limit,
    select: { id: true, fullName: true, exp: true }
  });

  return {
    ok: true,
    users: users.map((user, index) => ({
      position: index + 1,
      id: user.id,
      fullName: user.fullName,
      exp: user.exp,
      level: levelOf(user.exp)
    }))
  };
}

export async function ratingRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", { schema: ratingRouteSchema }, async (request) => buildRating(app, request.query));
}

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["dashboard"], summary: "Mening statistikam va kurslarim" }
    },
    async (request) => {
      const user = request.currentUser!;

      const [completedLessons, certificates, aheadCount, tiesBefore, courses, progresses] =
        await Promise.all([
          app.prisma.lessonProgress.count({
            where: { userId: user.id, completedAt: { not: null } }
          }),
          app.prisma.certificate.count({ where: { userId: user.id } }),
          app.prisma.user.count({ where: { exp: { gt: user.exp } } }),
          app.prisma.user.count({
            where: {
              exp: user.exp,
              OR: [
                { createdAt: { lt: user.createdAt } },
                { createdAt: user.createdAt, id: { lt: user.id } }
              ]
            }
          }),
          app.prisma.course.findMany({
            where: { published: true },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                select: { id: true, title: true, position: true }
              }
            }
          }),
          app.prisma.lessonProgress.findMany({
            where: { userId: user.id },
            select: {
              lessonId: true,
              startedAt: true,
              completedAt: true,
              lesson: { select: { courseId: true } }
            }
          })
        ]);

      const progressByCourse = new Map<
        string,
        Array<{ lessonId: string; startedAt: Date; completedAt: Date | null }>
      >();

      for (const progress of progresses) {
        const courseId = progress.lesson.courseId;
        const list = progressByCourse.get(courseId);
        const entry = {
          lessonId: progress.lessonId,
          startedAt: progress.startedAt,
          completedAt: progress.completedAt
        };
        if (list) {
          list.push(entry);
        } else {
          progressByCourse.set(courseId, [entry]);
        }
      }

      const items = courses.map((course) => {
        const courseProgress = progressByCourse.get(course.id) ?? [];
        const completedIds = new Set(
          courseProgress.filter((item) => item.completedAt !== null).map((item) => item.lessonId)
        );
        const lessonsCount = course.lessons.length;
        const completedCount = completedIds.size;
        const nextLesson = course.lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;
        const lastActivityAt = courseProgress.reduce<Date | null>(
          (latest, item) => (latest === null || item.startedAt > latest ? item.startedAt : latest),
          null
        );

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          lessonsCount,
          completedCount,
          percent: lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0,
          nextLessonId: nextLesson?.id ?? null,
          nextLessonTitle: nextLesson?.title ?? null,
          lastActivityAt: lastActivityAt ? lastActivityAt.toISOString() : null
        };
      });

      items.sort((a, b) => {
        if (a.lastActivityAt && b.lastActivityAt) {
          if (a.lastActivityAt !== b.lastActivityAt) {
            return b.lastActivityAt.localeCompare(a.lastActivityAt);
          }
          return a.title.localeCompare(b.title);
        }
        if (a.lastActivityAt) return -1;
        if (b.lastActivityAt) return 1;
        return a.title.localeCompare(b.title);
      });

      return {
        ok: true,
        stats: {
          exp: user.exp,
          level: levelOf(user.exp),
          completedLessons,
          certificates,
          ratingPosition: aheadCount + tiesBefore + 1
        },
        courses: items
      };
    }
  );

  app.get(
    "/rating",
    { schema: ratingRouteSchema },
    async (request) => buildRating(app, request.query)
  );
}
