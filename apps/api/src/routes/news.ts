import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { conflict, notFound } from "../lib/errors.js";

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const slugParamsSchema = z.object({ slug: z.string().trim().min(1) });

const newsBodySchema = z.object({
  slug: z.string().trim().min(2),
  title: z.string().trim().min(2),
  summary: z.string().trim().optional(),
  body: z.string().trim().min(2),
  category: z.string().trim().optional(),
  published: z.boolean().optional()
});

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function newsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    { schema: { tags: ["news"], summary: "Nashr qilingan yangiliklar (ochiq)" } },
    async (request) => {
      const { category, limit } = listQuerySchema.parse(request.query ?? {});

      const news = await app.prisma.news.findMany({
        where: { published: true, ...(category ? { category } : {}) },
        orderBy: { publishedAt: "desc" },
        take: limit ?? 50,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          category: true,
          coverUrl: true,
          publishedAt: true
        }
      });

      return { ok: true, count: news.length, news };
    }
  );

  app.get(
    "/:slug",
    { schema: { tags: ["news"], summary: "Yangilik tafsiloti (ochiq)" } },
    async (request) => {
      const { slug } = slugParamsSchema.parse(request.params);
      const item = await app.prisma.news.findFirst({
        where: { slug, published: true }
      });
      if (!item) throw notFound("Yangilik topilmadi");
      return { ok: true, news: item };
    }
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["news"], summary: "Yangilik qo'shish (admin+)" }
    },
    async (request, reply) => {
      const input = newsBodySchema.parse(request.body);
      try {
        const item = await app.prisma.news.create({
          data: {
            slug: input.slug,
            title: input.title,
            summary: input.summary ?? null,
            body: input.body,
            category: input.category ?? null,
            published: input.published ?? false
          }
        });
        return reply.status(201).send({ ok: true, news: item });
      } catch (error) {
        if (isUniqueConstraintError(error)) throw conflict("Bu slug allaqachon band");
        throw error;
      }
    }
  );
}
