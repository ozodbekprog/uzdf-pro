import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../lib/errors.js";
import { pointInPolygon, type Polygon } from "../services/geo.js";

const pointSchema = z.tuple([
  z.number().min(-90, "Lat -90..90 oralig'ida").max(90),
  z.number().min(-180, "Lng -180..180 oralig'ida").max(180)
]);

const polygonSchema = z.array(pointSchema).min(3, "Kamida 3 nuqta kerak").max(1000);

const zoneBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["RED", "YELLOW", "GREEN"]),
  description: z.string().trim().max(500).optional(),
  polygon: polygonSchema,
  active: z.boolean().optional()
});

const zonePatchSchema = zoneBodySchema.partial();

const checkSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export async function zoneRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/",
    {
      schema: { tags: ["zones"], summary: "Faol geozonalar ro'yxati (ochiq)" }
    },
    async () => {
      const zones = await app.prisma.zone.findMany({
        where: { active: true },
        orderBy: { createdAt: "asc" }
      });
      return { ok: true, count: zones.length, zones };
    }
  );

  app.get(
    "/manage",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["zones"], summary: "Barcha zonalar (moderator+)" }
    },
    async () => {
      const zones = await app.prisma.zone.findMany({ orderBy: { createdAt: "desc" } });
      return { ok: true, count: zones.length, zones };
    }
  );

  app.get(
    "/stats",
    {
      schema: { tags: ["zones"], summary: "Zonalar statistikasi: jami, faol va turlar bo'yicha (ochiq)" }
    },
    async () => {
      const [total, active, grouped] = await Promise.all([
        app.prisma.zone.count(),
        app.prisma.zone.count({ where: { active: true } }),
        app.prisma.zone.groupBy({ by: ["type"], _count: { _all: true } })
      ]);

      const byType: Record<"RED" | "YELLOW" | "GREEN", number> = { RED: 0, YELLOW: 0, GREEN: 0 };
      for (const row of grouped) {
        byType[row.type] = row._count._all;
      }

      return { ok: true, total, active, byType };
    }
  );

  app.get(
    "/export",
    {
      schema: { tags: ["zones"], summary: "Faol zonalarni GeoJSON formatida eksport qilish (ochiq)" }
    },
    async () => {
      const zones = await app.prisma.zone.findMany({
        where: { active: true },
        orderBy: { createdAt: "asc" }
      });

      const features = zones.map((zone) => {
        const polygon = zone.polygon as Polygon;
        const ring = polygon.map(([lat, lng]): [number, number] => [lng, lat]);

        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
          ring.push([first[0], first[1]]);
        }

        return {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [ring] },
          properties: {
            id: zone.id,
            name: zone.name,
            type: zone.type,
            description: zone.description
          }
        };
      });

      return { ok: true, type: "FeatureCollection", features };
    }
  );

  app.post(
    "/check",
    {
      schema: { tags: ["zones"], summary: "Nuqta qaysi zonalar ichida ekanini aniqlash" }
    },
    async (request) => {
      const input = checkSchema.parse(request.body);
      const zones = await app.prisma.zone.findMany({ where: { active: true } });

      const matches = zones.filter((zone) =>
        pointInPolygon(zone.polygon as Polygon, input.lat, input.lng)
      );

      const highest = matches.find((zone) => zone.type === "RED")
        ? "RED"
        : matches.find((zone) => zone.type === "YELLOW")
          ? "YELLOW"
          : matches.length > 0
            ? "GREEN"
            : "CLEAR";

      return {
        ok: true,
        status: highest,
        zones: matches.map((zone) => ({
          id: zone.id,
          name: zone.name,
          type: zone.type,
          description: zone.description
        }))
      };
    }
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["zones"], summary: "Yangi geozona yaratish (moderator+)" }
    },
    async (request, reply) => {
      const input = zoneBodySchema.parse(request.body);
      const zone = await app.prisma.zone.create({
        data: {
          name: input.name,
          type: input.type,
          description: input.description,
          polygon: input.polygon,
          active: input.active ?? true,
          createdById: request.currentUser!.id
        }
      });
      return reply.status(201).send({ ok: true, zone });
    }
  );

  app.get(
    "/:id",
    {
      schema: { tags: ["zones"], summary: "Zona ma'lumotlari (ochiq)" }
    },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      const zone = await app.prisma.zone.findUnique({ where: { id } });
      if (!zone) throw notFound("Zona topilmadi");

      return { ok: true, zone };
    }
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("MODERATOR", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["zones"], summary: "Zonani tahrirlash (moderator+)" }
    },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const input = zonePatchSchema.parse(request.body);

      const existing = await app.prisma.zone.findUnique({ where: { id } });
      if (!existing) throw notFound("Zona topilmadi");

      const zone = await app.prisma.zone.update({ where: { id }, data: input });
      return { ok: true, zone };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("ADMIN", "SUPERADMIN")],
      schema: { tags: ["zones"], summary: "Zonani o'chirish (admin+)" }
    },
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      const existing = await app.prisma.zone.findUnique({ where: { id } });
      if (!existing) throw notFound("Zona topilmadi");

      if (existing.type === "RED" && request.currentUser!.role !== "SUPERADMIN") {
        throw badRequest("RED zonani faqat superadmin o'chira oladi");
      }

      await app.prisma.zone.delete({ where: { id } });
      return { ok: true, message: "Zona o'chirildi" };
    }
  );
}
