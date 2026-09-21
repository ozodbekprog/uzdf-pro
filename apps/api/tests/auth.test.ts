import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { createVerifiedUser, resetDb } from "./helpers.js";

const app = await buildApp();

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("auth oqimi", () => {
  it("OTP tasdiqlamaguncha login qilmaydi, tasdiqlangach ishlaydi", async () => {
    const register = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: { email: "ali@test.uz", password: "Parol123!", fullName: "Ali" }
    });

    expect(register.statusCode).toBe(201);
    const { devOtp } = register.json() as { devOtp: string };
    expect(devOtp).toMatch(/^\d{6}$/);

    const earlyLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "ali@test.uz", password: "Parol123!" }
    });
    expect(earlyLogin.statusCode).toBe(403);

    const verify = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-email",
      payload: { email: "ali@test.uz", otp: devOtp }
    });
    expect(verify.statusCode).toBe(200);

    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "ali@test.uz", password: "Parol123!" }
    });
    expect(login.statusCode).toBe(200);
    const body = login.json() as { accessToken: string; user: { email: string } };
    expect(body.accessToken).toBeTruthy();
    expect(body.user.email).toBe("ali@test.uz");

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${body.accessToken}` }
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as { user: { email: string } }).user.email).toBe("ali@test.uz");
  });

  it("noto'g'ri OTP kodni rad etadi", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: { email: "vali@test.uz", password: "Parol123!", fullName: "Vali" }
    });

    const verify = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-email",
      payload: { email: "vali@test.uz", otp: "000000" }
    });
    expect(verify.statusCode).toBe(400);
  });

  it("noto'g'ri parol bilan login 401 qaytaradi", async () => {
    const session = await createVerifiedUser(app, { email: "pilot1@test.uz" });

    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "pilot1@test.uz", password: "NotoGriParol1" }
    });

    expect(login.statusCode).toBe(401);
    expect(session.user.id).toBeTruthy();
  });

  it("refresh token rotatsiyasi: eski token qayta ishlatilmaydi", async () => {
    const session = await createVerifiedUser(app, { email: "pilot2@test.uz" });

    const first = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: session.refreshToken }
    });
    expect(first.statusCode).toBe(200);
    const newTokens = first.json() as { refreshToken: string };
    expect(newTokens.refreshToken).not.toBe(session.refreshToken);

    const reuse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: session.refreshToken }
    });
    expect(reuse.statusCode).toBe(401);
  });

  it("logout refresh tokenni bekor qiladi", async () => {
    const session = await createVerifiedUser(app, { email: "pilot3@test.uz" });

    const logout = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: { refreshToken: session.refreshToken }
    });
    expect(logout.statusCode).toBe(200);

    const refresh = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: { refreshToken: session.refreshToken }
    });
    expect(refresh.statusCode).toBe(401);
  });
});
