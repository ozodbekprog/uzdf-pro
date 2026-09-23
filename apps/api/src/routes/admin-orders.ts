import type { OrderStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, conflict, notFound } from "../lib/errors.js";

const orderParamsSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "DELIVERED", "CANCELLED"]).optional()
});

const orderStatusSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "DELIVERED", "CANCELLED"])
});

// Holat o'tishlari: DELIVERED va CANCELLED — terminal holatlar.
const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: []
};

const orderInclude = {
  product: { select: { slug: true, name: true, price: true } },
  user: { select: { email: true, fullName: true } }
} as const;

export async function adminOrderRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-orders"], summary: "Barcha buyurtmalar (moderator+)" }
    },
    async (request) => {
      const { status } = listQuerySchema.parse(request.query ?? {});
      const orders = await app.prisma.order.findMany({
        where: status ? { status } : {},
        orderBy: { createdAt: "desc" },
        take: 200,
        include: orderInclude
      });

      return { ok: true, count: orders.length, orders };
    }
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-orders"], summary: "Buyurtma holatini o'zgartirish (moderator+)" }
    },
    async (request) => {
      const { id } = orderParamsSchema.parse(request.params);
      const { status } = orderStatusSchema.parse(request.body);

      const existing = await app.prisma.order.findUnique({ where: { id } });
      if (!existing) throw notFound("Buyurtma topilmadi");

      if (!ALLOWED_TRANSITIONS[existing.status].includes(status)) {
        throw badRequest("Bu holat o'tishi mumkin emas");
      }

      const order = await app.prisma.$transaction(async (tx) => {
        // Atomik guard: holat shu orada boshqa so'rovda o'zgargan bo'lsa, yangilamaymiz
        // (aks holda bekor qilishda stock ikki marta qaytarilishi mumkin edi).
        const updated = await tx.order.updateMany({
          where: { id, status: existing.status },
          data: { status }
        });
        if (updated.count === 0) {
          throw conflict("Buyurtma holati boshqa so'rovda o'zgargan — qayta yuklang");
        }

        // Bekor qilinganda mahsulot zaxirasini buyurtma miqdoriga qaytaramiz.
        if (status === "CANCELLED") {
          await tx.product.update({
            where: { id: existing.productId },
            data: { stock: { increment: existing.quantity } }
          });
        }

        return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
      });

      return { ok: true, order };
    }
  );
}
