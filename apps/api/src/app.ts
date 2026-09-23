import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env.js";
import { AppError, registerErrorHandler } from "./lib/errors.js";
import { prisma } from "./lib/prisma.js";
import { registerAuth, registerPrisma } from "./plugins/plugins.js";
import { authRoutes } from "./routes/auth.js";
import { adminCertificateRoutes } from "./routes/admin-certificates.js";
import { adminNewsRoutes } from "./routes/admin-news.js";
import { adminOrderRoutes } from "./routes/admin-orders.js";
import { adminProductRoutes } from "./routes/admin-products.js";
import { adminQuizRoutes } from "./routes/admin-quizzes.js";
import { adminStatsRoutes } from "./routes/admin-stats.js";
import { adminUserRoutes } from "./routes/admin-users.js";
import { certificateRoutes } from "./routes/certificates.js";
import { courseRoutes } from "./routes/courses.js";
import { dashboardRoutes, ratingRoutes } from "./routes/dashboard.js";
import { healthRoutes } from "./routes/health.js";
import { newsRoutes } from "./routes/news.js";
import { quizRoutes } from "./routes/quizzes.js";
import { shopRoutes } from "./routes/shop.js";
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

  // Bo'sh body bilan kelgan JSON so'rovlarni qabul qilamiz (masalan, body'siz POST).
  // Buzilgan JSON esa 500 emas, 400 qaytaradi.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => {
      const text = typeof body === "string" ? body.trim() : "";
      if (text === "") {
        done(null, undefined);
        return;
      }
      try {
        done(null, JSON.parse(text));
      } catch {
        done(new AppError(400, "BAD_REQUEST", "JSON formati noto'g'ri"), undefined);
      }
    }
  );

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
        { name: "courses", description: "Akademiya va progress" },
        { name: "quizzes", description: "Dars testlari va baholash" },
        { name: "news", description: "Soha yangiliklari" },
        { name: "shop", description: "Dron do'koni va buyurtmalar" },
        { name: "admin", description: "Admin panel: boshqaruv va statistika" }
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
  await app.register(quizRoutes, { prefix: "/api/v1/quizzes" });
  await app.register(newsRoutes, { prefix: "/api/v1/news" });
  await app.register(shopRoutes, { prefix: "/api/v1/shop" });

  await app.register(adminStatsRoutes, { prefix: "/api/v1/admin/stats" });
  await app.register(adminUserRoutes, { prefix: "/api/v1/admin/users" });
  await app.register(adminNewsRoutes, { prefix: "/api/v1/admin/news" });
  await app.register(adminProductRoutes, { prefix: "/api/v1/admin/products" });
  await app.register(adminOrderRoutes, { prefix: "/api/v1/admin/orders" });
  await app.register(adminQuizRoutes, { prefix: "/api/v1/admin/quizzes" });
  await app.register(adminCertificateRoutes, { prefix: "/api/v1/admin/certificates" });

  return app;
}
