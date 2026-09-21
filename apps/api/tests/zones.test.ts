import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { authHeader, createVerifiedUser, resetDb } from "./helpers.js";

const app = await buildApp();

const TEST_POLYGON = [
  [41.3, 69.2],
  [41.3, 69.3],
  [41.2, 69.3],
  [41.2, 69.2]
];

beforeEach(async () => {
  await resetDb(app);
});

afterAll(async () => {
  await app.close();
});

describe("geozonalar", () => {
  it("moderator zona yaratadi, nuqta tekshiruvi RED qaytaradi", async () => {
    const moderator = await createVerifiedUser(app, { email: "mod@test.uz" });
    await app.prisma.user.update({
      where: { id: moderator.user.id },
      data: { role: "MODERATOR" }
    });

    const create = await app.inject({
      method: "POST",
      url: "/api/v1/zones",
      headers: authHeader(moderator),
      payload: {
        name: "Test taqiqlangan zona",
        type: "RED",
        description: "Test uchun",
        polygon: TEST_POLYGON
      }
    });
    expect(create.statusCode).toBe(201);

    const inside = await app.inject({
      method: "POST",
      url: "/api/v1/zones/check",
      payload: { lat: 41.25, lng: 69.25 }
    });
    expect(inside.statusCode).toBe(200);
    const insideBody = inside.json() as { status: string; zones: unknown[] };
    expect(insideBody.status).toBe("RED");
    expect(insideBody.zones).toHaveLength(1);

    const outside = await app.inject({
      method: "POST",
      url: "/api/v1/zones/check",
      payload: { lat: 40.0, lng: 70.5 }
    });
    expect((outside.json() as { status: string }).status).toBe("CLEAR");
  });

  it("oddiy pilot zona yarata olmaydi (403)", async () => {
    const pilot = await createVerifiedUser(app, { email: "pilot4@test.uz" });

    const create = await app.inject({
      method: "POST",
      url: "/api/v1/zones",
      headers: authHeader(pilot),
      payload: { name: "Ruxsatsiz zona", type: "GREEN", polygon: TEST_POLYGON }
    });

    expect(create.statusCode).toBe(403);
  });

  it("yaroqsiz poligon (2 nuqta) 400 qaytaradi", async () => {
    const moderator = await createVerifiedUser(app, { email: "mod2@test.uz" });
    await app.prisma.user.update({
      where: { id: moderator.user.id },
      data: { role: "MODERATOR" }
    });

    const create = await app.inject({
      method: "POST",
      url: "/api/v1/zones",
      headers: authHeader(moderator),
      payload: {
        name: "Buzuq zona",
        type: "GREEN",
        polygon: [
          [41.3, 69.2],
          [41.2, 69.3]
        ]
      }
    });

    expect(create.statusCode).toBe(400);
  });

  it("ochiq ro'yxat faqat faol zonalarni ko'rsatadi", async () => {
    const admin = await createVerifiedUser(app, { email: "admin2@test.uz" });
    await app.prisma.user.update({ where: { id: admin.user.id }, data: { role: "ADMIN" } });

    await app.prisma.zone.create({
      data: {
        name: "Faol zona",
        type: "GREEN",
        polygon: TEST_POLYGON,
        createdById: admin.user.id
      }
    });
    await app.prisma.zone.create({
      data: {
        name: "Noaktiv zona",
        type: "YELLOW",
        polygon: TEST_POLYGON,
        active: false,
        createdById: admin.user.id
      }
    });

    const list = await app.inject({ method: "GET", url: "/api/v1/zones" });
    expect(list.statusCode).toBe(200);
    const body = list.json() as { zones: Array<{ name: string }> };
    expect(body.zones).toHaveLength(1);
    expect(body.zones[0]?.name).toBe("Faol zona");
  });

  it("statistika total/active/byType ni to'g'ri hisoblaydi", async () => {
    const admin = await createVerifiedUser(app, { email: "admin-stats@test.uz" });
    await app.prisma.user.update({ where: { id: admin.user.id }, data: { role: "ADMIN" } });

    await app.prisma.zone.create({
      data: {
        name: "Faol RED zona",
        type: "RED",
        polygon: TEST_POLYGON,
        createdById: admin.user.id
      }
    });
    await app.prisma.zone.create({
      data: {
        name: "Faol GREEN zona",
        type: "GREEN",
        polygon: TEST_POLYGON,
        createdById: admin.user.id
      }
    });
    await app.prisma.zone.create({
      data: {
        name: "Noaktiv YELLOW zona",
        type: "YELLOW",
        polygon: TEST_POLYGON,
        active: false,
        createdById: admin.user.id
      }
    });

    const res = await app.inject({ method: "GET", url: "/api/v1/zones/stats" });
    expect(res.statusCode).toBe(200);
    const stats = res.json() as {
      ok: boolean;
      total: number;
      active: number;
      byType: { RED: number; YELLOW: number; GREEN: number };
    };
    expect(stats.ok).toBe(true);
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2);
    expect(stats.byType).toEqual({ RED: 1, YELLOW: 1, GREEN: 1 });
  });

  it("GeoJSON eksport faqat faol zonalarni yopiq halqa va [lng,lat] tartibida qaytaradi", async () => {
    const admin = await createVerifiedUser(app, { email: "admin-export@test.uz" });
    await app.prisma.user.update({ where: { id: admin.user.id }, data: { role: "ADMIN" } });

    await app.prisma.zone.create({
      data: {
        name: "Faol zona",
        type: "RED",
        description: "Eksport uchun",
        polygon: TEST_POLYGON,
        createdById: admin.user.id
      }
    });
    await app.prisma.zone.create({
      data: {
        name: "Noaktiv zona",
        type: "GREEN",
        polygon: TEST_POLYGON,
        active: false,
        createdById: admin.user.id
      }
    });

    const res = await app.inject({ method: "GET", url: "/api/v1/zones/export" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      ok: boolean;
      type: string;
      features: Array<{
        type: string;
        geometry: { type: string; coordinates: number[][][] };
        properties: { id: string; name: string; type: string; description: string | null };
      }>;
    };
    expect(body.ok).toBe(true);
    expect(body.type).toBe("FeatureCollection");
    expect(body.features).toHaveLength(1);

    const feature = body.features[0]!;
    expect(feature.type).toBe("Feature");
    expect(feature.geometry.type).toBe("Polygon");
    expect(feature.properties.name).toBe("Faol zona");
    expect(feature.properties.description).toBe("Eksport uchun");

    const ring = feature.geometry.coordinates[0]!;
    expect(ring).toHaveLength(TEST_POLYGON.length + 1);
    expect(ring[0]).toEqual([69.2, 41.3]);
    expect(ring[1]).toEqual([69.3, 41.3]);
    expect(ring[ring.length - 1]).toEqual(ring[0]);
  });

  it("GET /:id zonani qaytaradi, noma'lum uuid uchun 404", async () => {
    const admin = await createVerifiedUser(app, { email: "admin-get@test.uz" });
    await app.prisma.user.update({ where: { id: admin.user.id }, data: { role: "ADMIN" } });

    const created = await app.prisma.zone.create({
      data: {
        name: "Bitta zona",
        type: "YELLOW",
        polygon: TEST_POLYGON,
        createdById: admin.user.id
      }
    });

    const found = await app.inject({ method: "GET", url: `/api/v1/zones/${created.id}` });
    expect(found.statusCode).toBe(200);
    const foundBody = found.json() as { ok: boolean; zone: { id: string; name: string } };
    expect(foundBody.ok).toBe(true);
    expect(foundBody.zone.id).toBe(created.id);
    expect(foundBody.zone.name).toBe("Bitta zona");

    const missing = await app.inject({ method: "GET", url: `/api/v1/zones/${randomUUID()}` });
    expect(missing.statusCode).toBe(404);
    const missingBody = missing.json() as { ok: boolean; error: { code: string; message: string } };
    expect(missingBody.ok).toBe(false);
    expect(missingBody.error.code).toBe("NOT_FOUND");
    expect(missingBody.error.message).toBe("Zona topilmadi");
  });
});
