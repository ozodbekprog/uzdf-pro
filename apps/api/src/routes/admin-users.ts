import type { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, forbidden, notFound } from "../lib/errors.js";
import { publicUser } from "../lib/tokens.js";

const ROLE_RANK: Record<string, number> = {
  PILOT: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPERADMIN: 3
};

function rank(role: string): number {
  return ROLE_RANK[role] ?? 0;
}

const roleSchema = z.enum(["PILOT", "MODERATOR", "ADMIN", "SUPERADMIN"]);

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  role: roleSchema.optional()
});

const userParamsSchema = z.object({ id: z.string().uuid() });

const updateUserBodySchema = z.object({
  role: roleSchema.optional(),
  exp: z.number().int().min(0).optional(),
  emailVerified: z.boolean().optional()
});

export async function adminUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-users"], summary: "Foydalanuvchilar ro'yxati (admin+)" }
    },
    async (request) => {
      const { search, role } = listQuerySchema.parse(request.query ?? {});

      const where: Prisma.UserWhereInput = {};
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } }
        ];
      }

      const users = await app.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          exp: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              progresses: true,
              certificates: true,
              quizAttempts: true,
              orders: true,
              violations: true
            }
          }
        }
      });

      return {
        ok: true,
        count: users.length,
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          exp: user.exp,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          counts: {
            lessons: user._count.progresses,
            certificates: user._count.certificates,
            attempts: user._count.quizAttempts,
            orders: user._count.orders,
            violations: user._count.violations
          }
        }))
      };
    }
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-users"], summary: "Foydalanuvchini tahrirlash (admin+)" }
    },
    async (request) => {
      const { id } = userParamsSchema.parse(request.params);
      const input = updateUserBodySchema.parse(request.body);

      if (request.currentUser!.id === id) {
        throw badRequest("O'zingizning rolingizni o'zgartira olmaysiz");
      }

      const existing = await app.prisma.user.findUnique({ where: { id } });
      if (!existing) throw notFound("Foydalanuvchi topilmadi");

      const actor = request.currentUser!;

      // Rol ierarxiyasi: o'zidan teng yoki yuqori rolni faqat SUPERADMIN boshqaradi.
      if (actor.role !== "SUPERADMIN" && rank(existing.role) >= rank(actor.role)) {
        throw forbidden("O'zingizdan yuqori yoki teng roldagi foydalanuvchini tahrirlay olmaysiz");
      }
      if (
        input.role !== undefined &&
        actor.role !== "SUPERADMIN" &&
        rank(input.role) >= rank(actor.role)
      ) {
        throw forbidden("Bu rolni faqat SUPERADMIN bera oladi");
      }

      const data: Prisma.UserUpdateInput = {};
      if (input.role !== undefined) data.role = input.role;
      if (input.exp !== undefined) data.exp = input.exp;
      if (input.emailVerified !== undefined) data.emailVerified = input.emailVerified;

      const user = await app.prisma.user.update({ where: { id }, data });
      return { ok: true, user: publicUser(user) };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-users"], summary: "Foydalanuvchini o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = userParamsSchema.parse(request.params);

      if (request.currentUser!.id === id) {
        throw badRequest("O'zingizni o'chira olmaysiz");
      }

      const existing = await app.prisma.user.findUnique({ where: { id } });
      if (!existing) throw notFound("Foydalanuvchi topilmadi");

      const actor = request.currentUser!;
      if (actor.role !== "SUPERADMIN" && rank(existing.role) >= rank(actor.role)) {
        throw forbidden("O'zingizdan yuqori yoki teng roldagi foydalanuvchini o'chira olmaysiz");
      }

      await app.prisma.user.delete({ where: { id } });
      return { ok: true, message: "Foydalanuvchi o'chirildi" };
    }
  );
}
