import type { PrismaClient, Role } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { forbidden, unauthorized } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (
      ...roles: Role[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    currentUser?: import("@prisma/client").User;
  }
}

export function registerPrisma(app: FastifyInstance, prisma: PrismaClient): void {
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
}

export function registerAuth(app: FastifyInstance): void {
  app.decorate("authenticate", async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      throw unauthorized("Token yaroqsiz yoki muddati tugagan");
    }

    const payload = request.user as { sub?: string };
    if (!payload.sub) throw unauthorized("Token yaroqsiz");

    const user = await app.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw unauthorized("Foydalanuvchi topilmadi");

    request.currentUser = user;
  });

  app.decorate(
    "authorize",
    (...roles: Role[]) =>
      async (request: FastifyRequest) => {
        const user = request.currentUser;
        if (!user) throw unauthorized();
        if (!roles.includes(user.role)) throw forbidden("Bu amal uchun ruxsatingiz yo'q");
      }
  );
}
