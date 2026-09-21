import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env.js";
import { registerErrorHandler } from "./lib/errors.js";
import { prisma } from "./lib/prisma.js";
import { registerAuth, registerPrisma } from "./plugins/plugins.js";
import { authRoutes } from "./routes/auth.js";
import { certificateRoutes } from "./routes/certificates.js";
import { courseRoutes } from "./routes/courses.js";
import { dashboardRoutes, ratingRoutes } from "./routes/dashboard.js";
import { healthRoutes } from "./routes/health.js";
import { zoneRoutes } from "./routes/zones.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === "test"
        ? false
        : {
            level: env.NODE_ENV === "production" ? "info" : "debug"
          },
    trustProxy: true
  });

  registerErrorHandler(app);

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true
  });

  await app.register(rateLimit, {
    max: env.NODE_ENV === "test" ? 100_000 : 120,
    timeWindow: "1 minute"
  });

  await app.register(jwt, { secret: env.JWT_SECRET });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "UZDF Pro API",
        description:
          "BPLA uchuvchilari platformasi: geozonalar, akademiya, rollar va EXP tizimi. UZDF'dan mukammalroq versiya.",
        version: "0.1.0"
      },
      tags: [
        { name: "health", description: "Servis holati" },
        { name: "auth", description: "Autentifikatsiya va JWT" },
        { name: "zones", description: "Geozonalar (RED/YELLOW/GREEN)" },
        { name: "courses", description: "Akademiya va progress" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        }
      }
    }
  });

  await app.register(swaggerUi, { routePrefix: "/docs" });

  registerPrisma(app, prisma);
  registerAuth(app);

  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(zoneRoutes, { prefix: "/api/v1/zones" });
  await app.register(courseRoutes, { prefix: "/api/v1/courses" });
  await app.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
  await app.register(ratingRoutes, { prefix: "/api/v1/rating" });
  await app.register(certificateRoutes, { prefix: "/api/v1/certificates" });

  return app;
}
