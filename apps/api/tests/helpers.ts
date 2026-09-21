import type { FastifyInstance } from "fastify";

export interface TestSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string; exp: number };
}

export async function resetDb(app: FastifyInstance): Promise<void> {
  await app.prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "RefreshToken","Violation","LessonProgress","Lesson","Course","Zone","User" RESTART IDENTITY CASCADE'
  );
}

export async function createVerifiedUser(
  app: FastifyInstance,
  overrides: { email?: string; password?: string; fullName?: string } = {}
): Promise<TestSession> {
  const email =
    overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.uz`;
  const password = overrides.password ?? "Parol123!";
  const fullName = overrides.fullName ?? "Test Uchuvchi";

  const register = await app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: { email, password, fullName }
  });

  if (register.statusCode !== 201) {
    throw new Error(`Register failed: ${register.statusCode} ${register.body}`);
  }

  const { devOtp } = register.json() as { devOtp: string };

  const verify = await app.inject({
    method: "POST",
    url: "/api/v1/auth/verify-email",
    payload: { email, otp: devOtp }
  });

  if (verify.statusCode !== 200) {
    throw new Error(`Verify failed: ${verify.statusCode} ${verify.body}`);
  }

  const login = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { email, password }
  });

  if (login.statusCode !== 200) {
    throw new Error(`Login failed: ${login.statusCode} ${login.body}`);
  }

  return login.json() as TestSession;
}

export function authHeader(session: TestSession): Record<string, string> {
  return { authorization: `Bearer ${session.accessToken}` };
}
