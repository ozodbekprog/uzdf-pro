import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { notFound } from "../lib/errors.js";

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional()
});

const certificateParamsSchema = z.object({ id: z.string().uuid() });

export async function adminCertificateRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-certificates"], summary: "Barcha sertifikatlar (admin+)" }
    },
    async (request) => {
      const { search } = listQuerySchema.parse(request.query ?? {});

      const where: Prisma.CertificateWhereInput = search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              {
                user: {
                  OR: [
                    { email: { contains: search, mode: "insensitive" } },
                    { fullName: { contains: search, mode: "insensitive" } }
                  ]
                }
              }
            ]
          }
        : {};

      const certificates = await app.prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        take: 200,
        select: {
          id: true,
          code: true,
          issuedAt: true,
          user: { select: { fullName: true, email: true } },
          course: { select: { title: true, slug: true } }
        }
      });

      return {
        ok: true,
        count: certificates.length,
        certificates: certificates.map((certificate) => ({
          id: certificate.id,
          code: certificate.code,
          issuedAt: certificate.issuedAt,
          user: {
            fullName: certificate.user.fullName,
            email: certificate.user.email
          },
          course: {
            title: certificate.course.title,
            slug: certificate.course.slug
          }
        }))
      };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["admin-certificates"], summary: "Sertifikatni o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = certificateParamsSchema.parse(request.params);

      const existing = await app.prisma.certificate.findUnique({ where: { id } });
      if (!existing) throw notFound("Sertifikat topilmadi");

      await app.prisma.certificate.delete({ where: { id } });
      return { ok: true, message: "Sertifikat o'chirildi" };
    }
  );
}
