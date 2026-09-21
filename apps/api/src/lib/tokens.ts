import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { PrismaClient, User } from "@prisma/client";
import { env } from "../env.js";

export interface IssueMeta {
  userAgent?: string;
  ip?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

type TokenDb = Pick<PrismaClient, "refreshToken">;

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export async function issueTokenPair(
  app: FastifyInstance,
  user: Pick<User, "id" | "email" | "role">,
  meta: IssueMeta = {},
  db: TokenDb = app.prisma
): Promise<TokenPair> {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    { expiresIn: env.ACCESS_TOKEN_TTL }
  );

  const refreshToken = createRefreshTokenValue();
  const refreshExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000);

  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip
    }
  });

  return { accessToken, refreshToken, refreshExpiresAt };
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    exp: user.exp,
    phone: user.phone,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt
  };
}
