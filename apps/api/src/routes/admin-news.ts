import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { conflict, notFound } from "../lib/errors.js";

const idParamsSchema = z.object({ id: z.string().trim().min(1) });

const createNewsSchema = z.object({
  slug: z.string().trim().min(2),
  title: z.string().trim().min(2),
  summary: z.string().trim().optional(),
  body: z.string().trim().min(2),
  category: z.string().trim().optional(),
  coverUrl: z.string().trim().optional(),
  published: z.boolean().optional()
});

const updateNewsSchema = createNewsSchema.partial();

const adminNewsSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  body: true,
  category: true,
  coverUrl: true,
  published: true,
  publishedAt: true
} as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2025"
  );
}

export async function adminNewsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-news"], summary: "Barcha yangiliklar (admin+)" }
    },
    async () => {
      const news = await app.prisma.news.findMany({
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: adminNewsSelect
      });

      return { ok: true, count: news.length, news };
    }
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-news"], summary: "Yangilik qo'shish (admin+)" }
    },
    async (request, reply) => {
      const input = createNewsSchema.parse(request.body);
      try {
        const news = await app.prisma.news.create({
          data: {
            slug: input.slug,
            title: input.title,
            summary: input.summary ?? null,
            body: input.body,
            category: input.category ?? null,
            coverUrl: input.coverUrl ?? null,
            published: input.published ?? false
          },
          select: adminNewsSelect
        });
        return reply.status(201).send({ ok: true, news });
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
      schema: { tags: ["admin-news"], summary: "Yangilikni tahrirlash (admin+)" }
    },
    async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const input = updateNewsSchema.parse(request.body);

      const data: {
        slug?: string;
        title?: string;
        summary?: string | null;
        body?: string;
        category?: string | null;
        coverUrl?: string | null;
        published?: boolean;
      } = {};

      if (input.slug !== undefined) data.slug = input.slug;
      if (input.title !== undefined) data.title = input.title;
      if (input.summary !== undefined) data.summary = input.summary;
      if (input.body !== undefined) data.body = input.body;
      if (input.category !== undefined) data.category = input.category;
      if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl;
      if (input.published !== undefined) data.published = input.published;

      try {
        const news = await app.prisma.news.update({
          where: { id },
          data,
          select: adminNewsSelect
        });
        return { ok: true, news };
      } catch (error) {
        if (isRecordNotFoundError(error)) throw notFound("Yangilik topilmadi");
        if (isUniqueConstraintError(error)) throw conflict("Bu slug allaqachon band");
        throw error;
      }
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-news"], summary: "Yangilikni o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      try {
        await app.prisma.news.delete({ where: { id } });
      } catch (error) {
        if (isRecordNotFoundError(error)) throw notFound("Yangilik topilmadi");
        throw error;
      }
      return { ok: true, message: "Yangilik o'chirildi" };
    }
  );
}
