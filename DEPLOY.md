# Deploy (Vercel + Neon)

## Arxitektura

- **Web** (`apps/web`) — Vercel loyihasi (Next.js).
- **API** (`apps/api`) — Vercel loyihasi (serverless funksiya, `api/index.ts` wrapper).
- **Baza** — bepul Neon Postgres (yoki Vercel Postgres / Supabase).

## 1. Baza (Neon)

1. https://neon.tech da bepul akkaunt yarating, loyiha oching.
2. Connection string oling:
   `postgresql://<user>:<password>@<host>/<db>?sslmode=require`
3. Lokaldan sxemani va seedni yuboring:
   ```bash
   cd apps/api
   DATABASE_URL="<neon-url>" npx prisma db push
   DATABASE_URL="<neon-url>" SEED_ADMIN_PASSWORD="<kuchli-parol>" SEED_PILOT_PASSWORD="<kuchli-parol>" npm run db:seed
   ```

## 2. API loyihasi (Vercel)

- Import qilinadigan papka: `apps/api`
- Environment variables:
  | nom | qiymat |
  | --- | --- |
  | `DATABASE_URL` | Neon connection string |
  | `JWT_SECRET` | kamida 32 belgi, tasodifiy |
  | `CORS_ORIGIN` | web URL (keyin yangilanadi), masalan `https://uzdf-pro-web.vercel.app` |
  | `NODE_ENV` | `production` |
- Deploy: `cd apps/api && vercel --prod`

## 3. Web loyihasi (Vercel)

- Import qilinadigan papka: `apps/web`
- Environment variables:
  | nom | qiymat |
  | --- | --- |
  | `NEXT_PUBLIC_API_URL` | API loyihasining URL'i, masalan `https://uzdf-pro-api.vercel.app` |
- Deploy: `cd apps/web && vercel --prod`

## 4. Yakuniy tekshiruv

- `https://<api-url>/health` -> `{"ok":true,...}`
- `https://<web-url>/academy` -> kurslar ko'rinadi
- Web'dan login: seedda yaratilgan akkauntlar bilan.

> Eslatma: Vercel Hobby tarifi serverless funksiyalar uchun 10 sekundlik limit
> qo'yadi (Pro'da 60s). Barcha API endpointlar shu limitga sig'adi.
