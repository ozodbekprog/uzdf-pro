# UZDF Pro

O'zbekiston BPLA (dron) uchuvchilari uchun platforma: geozonalar, o'quv akademiyasi,
pilot profili va boshqaruv uchun API. UZDF loyihasidan ilhomlangan, lekin
xavfsizlik va arxitektura jihatidan kuchaytirilgan versiya.

## Stek

| Qism | Texnologiya |
| --- | --- |
| API | Fastify 5, TypeScript, Zod, Prisma ORM |
| Baza | PostgreSQL (lokal klaster `.pgdata`, port 55432) |
| Auth | JWT (access 15m) + refresh token rotatsiyasi, bcrypt |
| Web | Next.js 16 (App Router), React 19, Tailwind CSS 4, Leaflet |
| Test | Vitest (25 test, real DB bilan) |

## Tez boshlash

```bash
npm install          # bog'liqliklar (monorepo)
npm run db:start     # lokal PostgreSQL klasterni ishga tushirish
npm run db:push      # sxemani bazaga qo'llash
npm run db:seed      # demo ma'lumotlar
npm run dev:api      # API: http://localhost:4000
npm run dev:web      # Web: http://localhost:3000
```

- API hujjatlari (Swagger): http://localhost:4000/docs
- To'xtatish: `npm run db:stop`

## Demo akkauntlar

| Rol | Email | Parol |
| --- | --- | --- |
| SUPERADMIN | admin@uzdf.pro | Admin123! |
| PILOT | pilot@uzdf.pro | Pilot123! |

> Parollarni productionga chiqishdan oldin almashtiring (`SEED_ADMIN_PASSWORD`,
> `SEED_PILOT_PASSWORD` env o'zgaruvchilari orqali beriladi).

## Testlar

```bash
npm test             # API testlari (uzdfpro_test bazasida, force-reset bilan)
npm run typecheck    # API TypeScript tekshiruvi
```

## Struktura

```
apps/
  api/               # Fastify API
    prisma/          # sxema + seed
    src/
      routes/        # health, auth, zones, courses
      plugins/       # prisma + auth dekoratorlari
      services/      # geo (point-in-polygon)
      lib/           # env, errors, tokens, password
    tests/           # vitest testlari
  web/               # Next.js web (landing, xarita, login, kabinet)
docs/
  ARCHITECTURE.md    # arxitektura qarorlari va roadmap
scripts/
  db-start.sh        # lokal PostgreSQL klasterni boshqarish
  db-stop.sh
```

## API (qisqacha)

- `POST /api/v1/auth/register` — ro'yxatdan o'tish (OTP, dev rejimda javobda `devOtp`)
- `POST /api/v1/auth/verify-email` — emailni tasdiqlash
- `POST /api/v1/auth/login` — access + refresh token
- `POST /api/v1/auth/refresh` — token rotatsiyasi
- `POST /api/v1/auth/logout` — refresh tokenni bekor qilish
- `GET /api/v1/auth/me` — profil
- `GET /api/v1/zones` — faol geozonalar (ochiq)
- `POST /api/v1/zones/check` — nuqta qaysi zonada ekanini aniqlash
- `GET /api/v1/zones/stats` — zonalar statistikasi
- `GET /api/v1/zones/export` — GeoJSON eksport
- `POST /api/v1/zones` — zona yaratish (MODERATOR+)
- `PATCH/DELETE /api/v1/zones/:id` — tahrirlash/o'chirish (moderator/admin)
- `GET /api/v1/courses` — kurslar ro'yxati (ochiq)
- `GET /api/v1/courses/:slug` — kurs + darslar (videoUrl bilan)
- `POST /api/v1/courses` — kurs yaratish (ADMIN+)
- `PATCH/DELETE /api/v1/courses/:id` — kursni tahrirlash/o'chirish (ADMIN+)
- `POST /api/v1/courses/:id/lessons` — dars qo'shish (ADMIN+)
- `PATCH/DELETE /api/v1/courses/lessons/:id` — darsni tahrirlash/o'chirish (ADMIN+)
- `POST /api/v1/courses/lessons/:id/start` — darsni boshlash
- `POST /api/v1/courses/lessons/:id/complete` — yakunlash (anti-cheat, EXP beriladi)
- `GET /api/v1/courses/me/progress` — o'quv progressi

## Web sahifalar

- `/` — landing
- `/zones` — interaktiv geozonalar xaritasi va nuqta tekshiruvi
- `/academy` va `/academy/[slug]` — video darslar, progress va EXP
- `/register` — OTP bilan ro'yxatdan o'tish
- `/login` — kirish
- `/dashboard` — pilot kabineti (EXP, daraja, progress)
- `/admin` — moderator/admin paneli: zonalar statistikasi, xaritada chizish, CRUD

## Deploy

Vercel (web + API) va Neon Postgres uchun qadamlar: [`DEPLOY.md`](./DEPLOY.md).

## Xavfsizlik tamoyillari

- Maxfiy kalitlar faqat `.env`da (repo'ga tushmaydi); productionda `JWT_SECRET` majburiy.
- Refresh tokenlar bazada faqat SHA-256 hash ko'rinishida saqlanadi va rotatsiya qilinadi.
- Rollar: PILOT, MODERATOR, ADMIN, SUPERADMIN; har bir amal uchun tekshiriladi.
- Rate limit, helmet, Zod validatsiya, yagona xatolik formati.
