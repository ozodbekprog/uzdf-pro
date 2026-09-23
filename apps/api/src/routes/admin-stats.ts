import type { FastifyInstance } from "fastify";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const statsRouteSchema = {
  tags: ["admin"],
  summary: "Admin panel statistikasi (moderator+)"
};

export async function adminStatsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: statsRouteSchema
    },
    async () => {
      const weekAgo = new Date(Date.now() - WEEK_MS);
      const prisma = app.prisma;

      const [
        usersTotal,
        pilots,
        moderators,
        admins,
        newThisWeek,
        coursesTotal,
        coursesPublished,
        lessonsTotal,
        quizzesTotal,
        questionsTotal,
        attemptsTotal,
        attemptsPassed,
        newsTotal,
        newsPublished,
        productsTotal,
        productsActive,
        productsOutOfStock,
        ordersTotal,
        ordersNew,
        ordersDelivered,
        ordersCancelled,
        revenue,
        zonesTotal,
        zonesActive,
        certificatesTotal
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "PILOT" } }),
        prisma.user.count({ where: { role: "MODERATOR" } }),
        prisma.user.count({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } }),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.course.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.lesson.count(),
        prisma.quiz.count(),
        prisma.question.count(),
        prisma.quizAttempt.count(),
        prisma.quizAttempt.count({ where: { passed: true } }),
        prisma.news.count(),
        prisma.news.count({ where: { published: true } }),
        prisma.product.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { active: true, stock: { lte: 0 } } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "NEW" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
        prisma.order.aggregate({
          where: { status: { in: ["DELIVERED", "CONFIRMED"] } },
          _sum: { total: true }
        }),
        prisma.zone.count(),
        prisma.zone.count({ where: { active: true } }),
        prisma.certificate.count()
      ]);

      return {
        ok: true,
        users: {
          total: usersTotal,
          pilots,
          moderators,
          admins,
          newThisWeek
        },
        courses: {
          total: coursesTotal,
          published: coursesPublished,
          lessons: lessonsTotal
        },
        quizzes: {
          total: quizzesTotal,
          questions: questionsTotal,
          attempts: attemptsTotal,
          passed: attemptsPassed
        },
        news: {
          total: newsTotal,
          published: newsPublished
        },
        products: {
          total: productsTotal,
          active: productsActive,
          outOfStock: productsOutOfStock
        },
        orders: {
          total: ordersTotal,
          new: ordersNew,
          delivered: ordersDelivered,
          cancelled: ordersCancelled,
          revenue: revenue._sum.total ?? 0
        },
        zones: {
          total: zonesTotal,
          active: zonesActive
        },
        certificates: {
          total: certificatesTotal
        }
      };
    }
  );
}
