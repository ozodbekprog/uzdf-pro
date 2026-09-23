import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Avtorizatsiya kerak") =>
  new AppError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Ruxsat yo'q") => new AppError(403, "FORBIDDEN", message);
export const notFound = (message = "Topilmadi") => new AppError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new AppError(409, "CONFLICT", message);
export const tooManyRequests = (message = "Juda ko'p so'rov") =>
  new AppError(429, "TOO_MANY_REQUESTS", message);

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Kiritilgan ma'lumotlar noto'g'ri",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        }
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        ok: false,
        error: { code: error.code, message: error.message, details: error.details }
      });
    }

    const statusCode = (error as { statusCode?: number }).statusCode;

    if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
      const code =
        statusCode === 429
          ? "TOO_MANY_REQUESTS"
          : statusCode === 415
            ? "UNSUPPORTED_MEDIA_TYPE"
            : statusCode === 413
              ? "PAYLOAD_TOO_LARGE"
              : "BAD_REQUEST";
      const message =
        statusCode === 429
          ? "Juda ko'p so'rov, keyinroq urinib ko'ring"
          : statusCode === 415
            ? "Content-Type qo'llab-quvvatlanmaydi"
            : "So'rov noto'g'ri formatda";
      return reply.status(statusCode).send({ ok: false, error: { code, message } });
    }

    request.log.error(error);
    return reply.status(500).send({
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Ichki xatolik" }
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      ok: false,
      error: { code: "NOT_FOUND", message: `${request.method} ${request.url} topilmadi` }
    });
  });
}
