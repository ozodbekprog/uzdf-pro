import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { conflict, notFound } from "../lib/errors.js";

const verifyParamsSchema = z.object({
  code: z.string().trim().min(4).max(32)
});

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export function generateCertificateCode(): string {
  return `UZDF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function issueCertificate(
  app: FastifyInstance,
  userId: string,
  courseId: string
): Promise<{ id: string; code: string; issuedAt: Date }> {
  const existing = await app.prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });
  if (existing) return existing;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await app.prisma.certificate.create({
        data: { userId, courseId, code: generateCertificateCode() }
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      const raced = await app.prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });
      if (raced) return raced;
    }
  }

  throw conflict("Sertifikat kodini yaratib bo'lmadi");
}

export async function certificateRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["certificates"], summary: "Mening sertifikatlarim" }
    },
    async (request) => {
      const certificates = await app.prisma.certificate.findMany({
        where: { userId: request.currentUser!.id },
        orderBy: { issuedAt: "desc" },
        include: {
          course: { select: { slug: true, title: true, description: true } }
        }
      });

      return {
        ok: true,
        certificates: certificates.map((certificate) => ({
          id: certificate.id,
          code: certificate.code,
          issuedAt: certificate.issuedAt,
          course: {
            slug: certificate.course.slug,
            title: certificate.course.title,
            description: certificate.course.description
          }
        }))
      };
    }
  );

  app.get(
    "/verify/:code",
    {
      schema: {
        tags: ["certificates"],
        summary: "Sertifikatni kod bo'yicha tekshirish (ochiq)"
      }
    },
    async (request) => {
      const { code } = verifyParamsSchema.parse(request.params);

      const certificate = await app.prisma.certificate.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          user: { select: { fullName: true } },
          course: { select: { slug: true, title: true } }
        }
      });

      if (!certificate) throw notFound("Sertifikat topilmadi");

      return {
        ok: true,
        valid: true,
        certificate: {
          code: certificate.code,
          issuedAt: certificate.issuedAt,
          user: { fullName: certificate.user.fullName },
          course: { slug: certificate.course.slug, title: certificate.course.title }
        }
      };
    }
  );
}
