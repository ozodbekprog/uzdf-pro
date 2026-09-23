import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { conflict, notFound } from "../lib/errors.js";

const productParamsSchema = z.object({ id: z.string().uuid() });

const productBodySchema = z.object({
  slug: z.string().trim().min(2),
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  price: z.number().int().min(0),
  imageUrl: z.string().trim().optional(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().optional()
});

const productPatchSchema = z.object({
  slug: z.string().trim().min(2).optional(),
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().trim().optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional()
});

const adminProductSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  category: true,
  price: true,
  imageUrl: true,
  stock: true,
  active: true
} as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

function isForeignKeyConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2003"
  );
}

export async function adminProductRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["shop"], summary: "Barcha mahsulotlar, nofaollari ham (admin+)" }
    },
    async () => {
      const products = await app.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        select: adminProductSelect
      });

      return { ok: true, count: products.length, products };
    }
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["shop"], summary: "Mahsulot qo'shish (admin+)" }
    },
    async (request, reply) => {
      const input = productBodySchema.parse(request.body);

      try {
        const product = await app.prisma.product.create({
          data: {
            slug: input.slug,
            name: input.name,
            description: input.description ?? null,
            category: input.category ?? null,
            price: input.price,
            imageUrl: input.imageUrl ?? null,
            stock: input.stock,
            active: input.active ?? true
          },
          select: adminProductSelect
        });
        return reply.status(201).send({ ok: true, product });
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
      schema: { tags: ["shop"], summary: "Mahsulotni tahrirlash (admin+)" }
    },
    async (request) => {
      const { id } = productParamsSchema.parse(request.params);
      const input = productPatchSchema.parse(request.body);

      const existing = await app.prisma.product.findUnique({ where: { id } });
      if (!existing) throw notFound("Mahsulot topilmadi");

      try {
        const product = await app.prisma.product.update({
          where: { id },
          data: input,
          select: adminProductSelect
        });
        return { ok: true, product };
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
      schema: { tags: ["shop"], summary: "Mahsulotni o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = productParamsSchema.parse(request.params);

      const existing = await app.prisma.product.findUnique({ where: { id } });
      if (!existing) throw notFound("Mahsulot topilmadi");

      try {
        await app.prisma.product.delete({ where: { id } });
      } catch (error) {
        if (isForeignKeyConstraintError(error)) {
          throw conflict(
            "Bu mahsulotga buyurtmalar bog'langan — o'chirish o'rniga faolsizlantiring"
          );
        }
        throw error;
      }

      return { ok: true, message: "Mahsulot o'chirildi" };
    }
  );
}
