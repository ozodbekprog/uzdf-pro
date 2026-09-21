import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Servis holati"
      }
    },
    async () => ({
      ok: true,
      service: "uzdfpro-api",
      version: "0.1.0",
      time: new Date().toISOString()
    })
  );

  app.get(
    "/health/db",
    {
      schema: {
        tags: ["health"],
        summary: "Baza bilan aloqa tekshiruvi"
      }
    },
    async (request, reply) => {
      try {
        await app.prisma.$queryRaw`SELECT 1`;
        return { ok: true, database: "up" };
      } catch (error) {
        request.log.error(error);
        return reply.status(503).send({ ok: false, database: "down" });
      }
    }
  );
}
