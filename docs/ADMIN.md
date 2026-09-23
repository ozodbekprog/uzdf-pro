# DRONCHI Admin panel — qo'llanma

**Oxirgi yangilangan:** 2026-09-23
**Tegishli kod:** `apps/web/app/admin/` (qobiq va sahifalar), `apps/web/lib/admin-api.ts` (API klient), `apps/api/src/routes/*.ts` (server marshrutlari), `apps/api/src/plugins/plugins.ts` (autentifikatsiya/ruxsat).

---

## 1. Kirish

DRONCHI admin paneli — platforma kontenti, foydalanuvchilari, geozonalari va do'konini boshqarish uchun veb-interfeys.

- **Manzil:** `/admin` (web ilova, `apps/web`).
- **Qobiq:** `apps/web/app/admin/layout.tsx` — yon menyu, rol belgisi va chiqish tugmasi.
- **Kim kira oladi:** faqat `MODERATOR`, `ADMIN`, `SUPERADMIN` rollari. Bu ro'yxat qobiqda qat'iy belgilangan:

  ```ts
  const MANAGER_ROLES = ["MODERATOR", "ADMIN", "SUPERADMIN"];
  ```

  - Tizimga kirmagan foydalanuvchi: "Admin panelga kirish uchun tizimga kiring." xabari va `/login` havolasi.
  - `PILOT` yoki pastroq ruxsatli foydalanuvchi: "Sizda admin panelga kirish huquqi yo'q. Faqat MODERATOR va undan yuqori rollar kira oladi." xabari.

> Eslatma: qobiq barcha `/admin/*` sahifalarini `MODERATOR+` uchun ochadi. Alohida bo'limlar uchun aniqroq ruxsat server tomonida tekshiriladi (5-bo'limga qarang).

---

## 2. Kirish yo'li

1. `/login` sahifasiga o'ting.
2. Seed'da yaratilgan admin akkaunt email va paroli bilan kiring.
3. Login `POST /api/v1/auth/login` orqali bajariladi (access + refresh token qaytadi).
4. Email tasdiqlanmagan (`emailVerified: false`) hisob kira olmaydi — server `Avval emailingizni tasdiqlang` xatosini qaytaradi. Seed admin hisobi `emailVerified: true` holda yaratiladi.

### Demo akkauntlar

| Muhit | Rol | Email | Parol |
| --- | --- | --- | --- |
| Lokal (seed) | SUPERADMIN | `admin@uzdf.pro` | `Admin123!` |
| Lokal (seed) | PILOT | `pilot@uzdf.pro` | `Pilot123!` |
| Live (production) | SUPERADMIN | `admin@uzdf.pro` | `Dronchi-Admin-2026!` |

- Lokal parollar seed zaxirasidan: `SEED_ADMIN_PASSWORD ?? "Admin123!"` va `SEED_PILOT_PASSWORD ?? "Pilot123!"` (`apps/api/prisma/seed.ts`).
- Parollar **muhitga qarab farq qiladi**: production'da `SEED_ADMIN_PASSWORD` env o'zgaruvchisi orqali kuchli parol beriladi (yuqoridagi live qiymat operator tomonidan berilgan, kodda saqlanmaydi).
- Parol kamida 8 belgidan iborat bo'lishi shart (`apps/api/src/routes/auth.ts`).

---

## 3. Bo'limlar jadvali

Yon menyu (`layout.tsx` dagi `NAV`) quyidagi guruh va sahifalarni e'lon qiladi. "Holat" ustuni hozirgi kodda sahifa mavjudligini ko'rsatadi.

| Bo'lim | Yo'l | Vazifa | Rol | Holat |
| --- | --- | --- | --- | --- |
| Umumiy holat | `/admin` | statistik kartalar + xarita muharriri | MODERATOR+ | Mavjud (`app/admin/page.tsx`) |
| Foydalanuvchilar | `/admin/users` | rol/EXP boshqaruvi, o'chirish | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |
| Kurslar va darslar | `/admin/courses` | kurs/dars CRUD | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |
| Testlar | `/admin/quizzes` | testlar ko'rinishi va tahriri | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |
| Yangiliklar | `/admin/news` | yangilik CRUD + nashr | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |
| Mahsulotlar | `/admin/products` | do'kon CRUD | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |
| Buyurtmalar | `/admin/orders` | holat boshqaruvi | MODERATOR+ | Nav va klient tayyor, sahifa hali yo'q |
| Geozonalar | `/admin/zones` | xarita muharriri | MODERATOR+ | Nav mavjud; funksiya hozircha `/admin` sahifasida |
| Sertifikatlar | `/admin/certificates` | ko'rish/bekor qilish | ADMIN+ | Nav va klient tayyor, sahifa hali yo'q |

**Menyu guruhlari:**

- **Boshqaruv:** Umumiy holat, Foydalanuvchilar, Sertifikatlar
- **Kontent:** Kurslar va darslar, Testlar, Yangiliklar
- **Savdo:** Mahsulotlar, Buyurtmalar
- **Xarita:** Geozonalar

**Hozir amalda bo'lgan yagona sahifa** — `/admin` (`apps/web/app/admin/page.tsx`): geozona statistikasi (jami/faol/RED/YELLOW+GREEN), Leaflet asosidagi xarita muharriri va zonalar ro'yxati (yaratish, tahrirlash, o'chirish). Bu sahifa ma'lumotni `GET /api/v1/zones/manage` va `GET /api/v1/zones/stats` orqali oladi.

---

## 4. API endpointlar jadvali

Quyidagi jadval `apps/web/lib/admin-api.ts` da e'lon qilingan **admin klient kontrakti** asosida tuzilgan. Klient barcha so'rovlarni `/api/v1/admin/*` ostiga yuboradi va `Bearer` token bilan avtorizatsiya qiladi.

| Metod | Yo'l | Rol | Tavsif |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/stats` | MODERATOR+ | Umumiy statistika: users, courses, quizzes, news, products, orders, zones, certificates |
| GET | `/api/v1/admin/users?search=&role=` | ADMIN+ | Foydalanuvchilar ro'yxati (qidiruv va rol filtri bilan) |
| PATCH | `/api/v1/admin/users/:id` | ADMIN+ | Rol, EXP yoki `emailVerified` ni yangilash |
| DELETE | `/api/v1/admin/users/:id` | ADMIN+ | Foydalanuvchini o'chirish |
| GET | `/api/v1/admin/news` | ADMIN+ | Barcha yangiliklar (qoralamalar bilan) |
| POST | `/api/v1/admin/news` | ADMIN+ | Yangilik yaratish |
| PATCH | `/api/v1/admin/news/:id` | ADMIN+ | Yangilikni tahrirlash |
| DELETE | `/api/v1/admin/news/:id` | ADMIN+ | Yangilikni o'chirish |
| GET | `/api/v1/admin/products` | ADMIN+ | Barcha mahsulotlar |
| POST | `/api/v1/admin/products` | ADMIN+ | Mahsulot yaratish |
| PATCH | `/api/v1/admin/products/:id` | ADMIN+ | Mahsulotni tahrirlash |
| DELETE | `/api/v1/admin/products/:id` | ADMIN+ | Mahsulotni o'chirish |
| GET | `/api/v1/admin/orders` | MODERATOR+ | Barcha buyurtmalar |
| PATCH | `/api/v1/admin/orders/:id` | MODERATOR+ | Buyurtma holatini o'zgartirish (`NEW`/`CONFIRMED`/`DELIVERED`/`CANCELLED`) |
| GET | `/api/v1/admin/quizzes` | ADMIN+ | Testlar ro'yxati (savollar, urinishlar bilan) |
| PUT | `/api/v1/admin/quizzes/:lessonId` | ADMIN+ | Darsga testni qo'shish/yangilash (upsert) |
| DELETE | `/api/v1/admin/quizzes/:id` | ADMIN+ | Testni o'chirish |
| GET | `/api/v1/admin/certificates` | ADMIN+ | Sertifikatlar ro'yxati |
| DELETE | `/api/v1/admin/certificates/:id` | ADMIN+ | Sertifikatni bekor qilish |

### Muhim eslatma: server marshrutlari

`apps/api/src/app.ts` hozircha `adminRoutes` ni ro'yxatdan o'tkazmaydi. Admin klientidagi `/api/v1/admin/*` manzillari serverda **hali mavjud emas**. Xuddi shu amallar hozir domen prefikslari ostida amalga oshirilgan:

| Amal | Amaldagi server marshruti | Rol |
| --- | --- | --- |
| Geozonalar | `GET /api/v1/zones/manage`, `GET /api/v1/zones/stats`, `POST /api/v1/zones`, `PATCH/DELETE /api/v1/zones/:id` | yaratish/tahrirlash MODERATOR+, o'chirish ADMIN+ |
| Yangiliklar | `GET /api/v1/news`, `GET /api/v1/news/:slug`, `POST /api/v1/news` | yangilik qo'shish ADMIN+ |
| Do'kon/mahsulotlar | `GET /api/v1/shop/products`, `GET /api/v1/shop/products/:slug` | ochiq |
| Buyurtmalar | `POST /api/v1/shop/orders`, `GET /api/v1/shop/orders/me`, `GET /api/v1/shop/orders`, `PATCH /api/v1/shop/orders/:id` | ko'rish/holat MODERATOR+ |
| Kurslar/darslar | `POST /api/v1/courses`, `PATCH/DELETE /api/v1/courses/:id`, `POST /api/v1/courses/:id/lessons`, `PATCH/DELETE /api/v1/courses/lessons/:lessonId` | ADMIN+ |
| Testlar | `GET /api/v1/quizzes/lesson/:lessonId`, `POST /api/v1/quizzes/:quizId/submit` | autentifikatsiya talab qilinadi |
| Sertifikatlar | `GET /api/v1/certificates/me`, `GET /api/v1/certificates/verify/:code` | o'qish/tekshirish |

> Shu sababli admin panelning ba'zi sahifa va amallari server tomoni to'liq tayyor bo'lmaguncha ishlamasligi mumkin. Serverda test qilishda amaldagi domen marshrutlaridan foydalaning.

---

## 5. Ruxsatlar modeli

### Rol ierarxiyasi

`apps/api/prisma/schema.prisma` dagi `Role` enum quyidagi tartibda:

```
PILOT  <  MODERATOR  <  ADMIN  <  SUPERADMIN
```

| Rol | Kod nomi | Yorliq (`layout.tsx`) |
| --- | --- | --- |
| Uchuvchi | `PILOT` | Uchuvchi |
| Moderator | `MODERATOR` | Moderator |
| Administrator | `ADMIN` | Administrator |
| Superadmin | `SUPERADMIN` | Superadmin |

### Ruxsat qanday tekshiriladi

`apps/api/src/plugins/plugins.ts` dagi `authorize()` dekoratori har bir marshrut uchun berilgan ro'yxat ichidan **aniq moslikni** tekshiradi:

```ts
if (!roles.includes(user.role)) throw forbidden("Bu amal uchun ruxsatingiz yo'q");
```

Muhim nuqta: kod **ierarxiyani avtomatik qo'llamaydi** — har bir marshrut o'z rol ro'yxatini aniq beradi. Masalan, `authorize("MODERATOR", "ADMIN", "SUPERADMIN")` yoki `authorize("ADMIN", "SUPERADMIN")`. Shu sababli yangi marshrut qo'shganda ruxsat ro'yxatini ham yangilash shart.

### Amallar va minimal rol

| Amal | Minimal rol | Manba |
| --- | --- | --- |
| Admin qobig'iga kirish | MODERATOR | `layout.tsx` (`MANAGER_ROLES`) |
| Geozonani ko'rish (boshqaruv ro'yxati), yaratish, tahrirlash | MODERATOR | `zones.ts` |
| Geozonani o'chirish | ADMIN | `zones.ts` |
| RED zonani o'chirish | SUPERADMIN | `zones.ts` (`existing.type === "RED" ... !== "SUPERADMIN"`) |
| Kurs yaratish/tahrirlash/o'chirish | ADMIN | `courses.ts` |
| Kursga dars qo'shish/tahrirlash/o'chirish | ADMIN | `courses.ts` |
| Yangilik qo'shish | ADMIN | `news.ts` |
| Buyurtmalarni ko'rish va holatini o'zgartirish | MODERATOR | `shop.ts` |
| Foydalanuvchi rol/EXP boshqaruvi, o'chirish | ADMIN (klient kontrakti) | `admin-api.ts` |
| Testlar CRUD | ADMIN (klient kontrakti) | `admin-api.ts` |
| Sertifikatlarni ko'rish/bekor qilish | ADMIN (klient kontrakti) | `admin-api.ts` |

---

## 6. Xavfsizlik eslatmalari

- **Admin parolini almashtirish.** Seed parollari (`Admin123!`, `Pilot123!`) faqat lokal ishlab chiqish uchun. Productionga chiqishdan oldin `SEED_ADMIN_PASSWORD` va `SEED_PILOT_PASSWORD` orqali kuchli parol bering va mavjud admin parolini almashtiring.
- **`JWT_SECRET` production'da kuchli bo'lishi shart.** `env.ts` production muhitida dev qiymat (`dev-secret-change-me`) ishlatilsa ilovani ishga tushirmaydi. Qo'shimcha tavsiya (DEPLOY.md): kamida 32 belgidan iborat tasodifiy satr.
- **`/docs` (Swagger UI) ni production'da yopish tavsiya etiladi.** `app.ts` da `swaggerUi` `routePrefix: "/docs"` bilan barcha muhitlarda ro'yxatdan o'tkaziladi; ochiq API hujjati production'da ommaviy bo'lmasligi uchun uni shartli ravishda o'chirish yoki himoyalash maqsadga muvofiq.
- **Tokenlar.** Access token muddati `15m`, refresh token rotatsiya bilan ishlaydi va bazada faqat SHA-256 hash ko'rinishida saqlanadi (`apps/api/src/lib/tokens.ts`).
- **Rate limit.** Umumiy limit daqiqada 120 so'rov (`app.ts`).
- **Validatsiya.** Barcha so'rovlar Zod sxemalari bilan tekshiriladi; xatolar yagona formatda qaytadi.

---

## 7. Ishlab chiqish

### Ishga tushirish

```bash
npm install          # monorepo bog'liqliklari
npm run db:start     # lokal PostgreSQL klaster (.pgdata, port 55432)
npm run db:push      # Prisma sxemasini bazaga qo'llash
npm run db:seed      # demo ma'lumotlar + admin/pilot akkauntlari
npm run dev:api      # API: http://localhost:4000
npm run dev:web      # Web: http://localhost:3000
```

- Admin panelga kirish: http://localhost:3000/admin
- API hujjatlari (Swagger UI): http://localhost:4000/docs
- Web `NEXT_PUBLIC_API_URL` orqali API manzilini oladi (standart: `http://localhost:4000`).

### Foydali skriptlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev:api` | API'ni ishlab chiqish rejimida ishga tushirish |
| `npm run dev:web` | Web ilovani ishlab chiqish rejimida ishga tushirish |
| `npm run db:seed` | Demo ma'lumotlarni qayta yuklash |
| `npm test` | API testlari (real DB bilan) |
| `npm run typecheck` | API TypeScript tekshiruvi |

### Neon bazasi (production)

`DEPLOY.md` ga muvofiq:

- Baza sifatida bepul **Neon Postgres** ishlatiladi.
- Connection string formati: `postgresql://<user>:<password>@<host>/<db>?sslmode=require`.
- Sxema va seed lokaldan yuboriladi:

  ```bash
  cd apps/api
  DATABASE_URL="<neon-url>" npx prisma db push
  DATABASE_URL="<neon-url>" SEED_ADMIN_PASSWORD="<kuchli-parol>" SEED_PILOT_PASSWORD="<kuchli-parol>" npm run db:seed
  ```

- API loyihasi env: `DATABASE_URL`, `JWT_SECRET` (kamida 32 belgi), `CORS_ORIGIN`, `NODE_ENV=production`.
- Web loyihasi env: `NEXT_PUBLIC_API_URL` (API URL'i).

---

## Bog'liq hujjatlar

- [README.md](../README.md) — umumiy loyiha ko'rinishi, API qisqachasi.
- [DEPLOY.md](../DEPLOY.md) — Vercel + Neon deploy bosqichlari.
- [docs/ARCHITECTURE.md](ARCHITECTURE.md) — arxitektura qarorlari.
