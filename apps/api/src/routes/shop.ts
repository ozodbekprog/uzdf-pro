import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../lib/errors.js";

const slugParamsSchema = z.object({ slug: z.string().trim().min(1) });

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const orderBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(9),
  address: z.string().trim().optional()
});

export async function shopRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/products",
    { schema: { tags: ["shop"], summary: "Faol mahsulotlar ro'yxati (ochiq)" } },
    async (request) => {
      const { category, limit } = listQuerySchema.parse(request.query ?? {});
      const products = await app.prisma.product.findMany({
        where: { active: true, ...(category ? { category } : {}) },
        orderBy: { createdAt: "asc" },
        take: limit ?? 50
      });

      return { ok: true, count: products.length, products };
    }
  );

  app.get(
    "/products/:slug",
    { schema: { tags: ["shop"], summary: "Mahsulot tafsiloti (ochiq)" } },
    async (request) => {
      const { slug } = slugParamsSchema.parse(request.params);
      const product = await app.prisma.product.findFirst({
        where: { slug, active: true }
      });
      if (!product) throw notFound("Mahsulot topilmadi");
      return { ok: true, product };
    }
  );

  app.post(
    "/orders",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["shop"], summary: "Dron uchun buyurtma berish" }
    },
    async (request, reply) => {
      const input = orderBodySchema.parse(request.body);

      const product = await app.prisma.product.findFirst({
        where: { id: input.productId, active: true }
      });
      if (!product) throw notFound("Mahsulot topilmadi");
      if (product.stock < input.quantity) {
        throw badRequest(`Omborda yetarli emas (mavjud: ${product.stock} dona)`);
      }

      const order = await app.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: input.quantity } }
        });

        return tx.order.create({
          data: {
            userId: request.currentUser!.id,
            productId: product.id,
            quantity: input.quantity,
            total: product.price * input.quantity,
            fullName: input.fullName,
            phone: input.phone,
            address: input.address ?? null
          },
          include: { product: { select: { slug: true, name: true, price: true } } }
        });
      });

      return reply.status(201).send({ ok: true, order });
    }
  );

  app.get(
    "/orders/me",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["shop"], summary: "Mening buyurtmalarim" }
    },
    async (request) => {
      const orders = await app.prisma.order.findMany({
        where: { userId: request.currentUser!.id },
        orderBy: { createdAt: "desc" },
        include: { product: { select: { slug: true, name: true, price: true } } }
      });

      return { ok: true, count: orders.length, orders };
    }
  );

  app.get(
    "/orders",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["shop"], summary: "Barcha buyurtmalar (moderator+)" }
    },
    async () => {
      const orders = await app.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          product: { select: { slug: true, name: true } },
          user: { select: { email: true, fullName: true } }
        }
      });

      return { ok: true, count: orders.length, orders };
    }
  );
}
