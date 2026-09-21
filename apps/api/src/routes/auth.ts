import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../env.js";
import { badRequest, conflict, forbidden, unauthorized } from "../lib/errors.js";
import { generateOtp, hashPassword, verifyPassword } from "../lib/password.js";
import { hashToken, issueTokenPair, publicUser } from "../lib/tokens.js";
import type { User } from "@prisma/client";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email noto'g'ri");
const passwordSchema = z.string().min(8, "Parol kamida 8 belgi bo'lishi kerak").max(72);

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2, "Ism juda qisqa").max(80),
  phone: z.string().trim().min(5).max(20).optional()
});

const verifySchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "Kod 6 xonali bo'lishi kerak")
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

const OTP_TTL_MS = 15 * 60 * 1000;
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8v7f4b2C/7bq6Yg1xXq1c8m1s0F1G6";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/register",
    {
      schema: { tags: ["auth"], summary: "Ro'yxatdan o'tish (OTP emailga yuboriladi)" }
    },
    async (request, reply) => {
      const input = registerSchema.parse(request.body);

      const existing = await app.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw conflict("Bu email allaqachon ro'yxatdan o'tgan");

      const otp = generateOtp();
      const user = await app.prisma.user.create({
        data: {
          email: input.email,
          passwordHash: await hashPassword(input.password),
          fullName: input.fullName,
          phone: input.phone,
          otpHash: hashToken(otp),
          otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
        }
      });

      request.log.info(
        { email: user.email, otp: env.NODE_ENV === "development" ? otp : undefined },
        "Tasdiqlash kodi yaratildi (SMTP integratsiyasi keyingi bosqichda)"
      );

      return reply.status(201).send({
        ok: true,
        message: "Ro'yxatdan o'tdingiz. Emailingizga yuborilgan 6 xonali kodni tasdiqlang.",
        ...(env.NODE_ENV === "production" ? {} : { devOtp: otp })
      });
    }
  );

  app.post(
    "/verify-email",
    {
      schema: { tags: ["auth"], summary: "Emailni OTP kod bilan tasdiqlash" }
    },
    async (request) => {
      const input = verifySchema.parse(request.body);

      const user = await app.prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !user.otpHash || !user.otpExpiresAt) {
        throw badRequest("Kod topilmadi, qaytadan ro'yxatdan o'ting");
      }
      if (user.otpExpiresAt.getTime() < Date.now()) throw badRequest("Kod muddati tugagan");
      if (user.otpHash !== hashToken(input.otp)) throw badRequest("Kod noto'g'ri");

      await app.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, otpHash: null, otpExpiresAt: null }
      });

      return { ok: true, message: "Email tasdiqlandi, endi tizimga kirishingiz mumkin" };
    }
  );

  app.post(
    "/login",
    {
      schema: { tags: ["auth"], summary: "Tizimga kirish (JWT + refresh token)" }
    },
    async (request) => {
      const input = loginSchema.parse(request.body);

      const user: User | null = await app.prisma.user.findUnique({
        where: { email: input.email }
      });
      const passwordOk = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !passwordOk) throw unauthorized("Email yoki parol noto'g'ri");
      if (!user.emailVerified) throw forbidden("Avval emailingizni tasdiqlang");

      const tokens = await issueTokenPair(app, user, {
        userAgent: request.headers["user-agent"],
        ip: request.ip
      });

      return {
        ok: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_TTL,
        user: publicUser(user)
      };
    }
  );

  app.post(
    "/refresh",
    {
      schema: { tags: ["auth"], summary: "Refresh tokenni yangilash (rotatsiya bilan)" }
    },
    async (request) => {
      const input = refreshSchema.parse(request.body);
      const tokenHash = hashToken(input.refreshToken);

      const record = await app.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
        throw unauthorized("Refresh token yaroqsiz, qaytadan kiring");
      }

      const tokens = await app.prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() }
        });
        return issueTokenPair(app, record.user, {
          userAgent: request.headers["user-agent"],
          ip: request.ip
        }, tx);
      });

      return {
        ok: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_TTL
      };
    }
  );

  app.post(
    "/logout",
    {
      schema: { tags: ["auth"], summary: "Chiqish (refresh tokenni bekor qilish)" }
    },
    async (request) => {
      const input = refreshSchema.parse(request.body);
      await app.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(input.refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
      });
      return { ok: true, message: "Chiqdingiz" };
    }
  );

  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: { tags: ["auth"], summary: "Profil ma'lumotlari" }
    },
    async (request) => {
      return { ok: true, user: publicUser(request.currentUser!) };
    }
  );
}
