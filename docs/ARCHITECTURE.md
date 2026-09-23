# Arxitektura va qarorlar

## Maqsad

UZDF (`u001us/UZDF`) tajribasidan kelib chiqib, BPLA uchuvchilari platformasini
xavfsizroq va kengaytiriladigan qilib qurish. UZDF'dagi ishlaydigan g'oyalar
(geozonalar, akademiya, EXP, rollar) saqlanadi, zaif joylar qayta ishlangan.

## UZDF bilan taqqoslash

| Jihat | UZDF | UZDF Pro |
| --- | --- | --- |
| Auth | JWT, OTP emailga | JWT + refresh rotatsiya, OTP dev/prod rejimda |
| Maxfiy kalitlar | Repo ichida API kalitlar bo'lishi mumkin | Faqat `.env`, productionda majburiy tekshiruv |
| Anti-cheat | Skroll/taymer serverda | Dars taymeri serverda, `startedAt`dan hisoblanadi |
| Validatsiya | Qo'lda | Zod sxemalari + yagona xatolik formati |
| Rollar | user/moderator/admin/superadmin | PILOT/MODERATOR/ADMIN/SUPERADMIN, har amalda tekshiruv |
| Baza | PostgreSQL + Prisma | Xuddi shunday + geo hisob-kitoblar servisda |
| Testlar | Ko'rinmaydi | 33 ta Vitest testi (auth, zonalar, akademiya, testlar) |
| API hujjat | Yo'q | Swagger `/docs` |

## Modullar

### API (Fastify)

- `app.ts` — pluginlar va routelarni yig'adi (helmet, cors, jwt, rate-limit, swagger).
- `routes/auth.ts` — OTP bilan ro'yxatdan o'tish, login, refresh rotatsiya, logout, me.
- `routes/zones.ts` — geozonalar CRUD (rolga qarab), nuqta tekshiruvi.
- `routes/courses.ts` — kurslar, darsni boshlash/yakunlash, EXP.
- `services/geo.ts` — ray-casting point-in-polygon (PostGIS'siz, MVP uchun).
- `lib/tokens.ts` — access/refresh tokenlar, SHA-256 hash.
- `plugins/plugins.ts` — `app.prisma`, `app.authenticate`, `app.authorize`.

### Web (Next.js)

- `/` — landing.
- `/zones` — Leaflet xarita, zonalar poligonlari, nuqta tekshiruvi.
- `/login` — JWT olish, tokenlar `localStorage`da (kelajakda httpOnly cookie'ga o'tish).
- `/dashboard` — profil, EXP, o'quv progressi.

### Baza (Prisma)

`User`, `RefreshToken`, `Zone`, `Course`, `Lesson`, `LessonProgress`, `Violation`.

Geozona poligoni `Json` sifatida saqlanadi (`[[lat, lng], ...]`). Bu MVP uchun
yetarli; katta hajmda PostGIS `geometry(Polygon, 4326)` + GiST indeksga o'tish
rejalashtirilgan.

## Xavfsizlik qarorlari

1. **Refresh token rotatsiyasi** — har refresh'da eski token bekor qilinadi;
   qayta ishlatilsa 401 (token o'g'irlanishini aniqlash imkoni).
2. **Parol** — bcrypt (10 rounds); login'da foydalanuvchi topilmasa ham dummy
   hash bilan solishtiriladi (timing attack'ni kamaytirish).
3. **OTP** — bazada hash ko'rinishida, 15 daqiqa amal qiladi.
4. **Rate limit** — 120 req/min (testda o'chirilgan).
5. **Rollar** — route darajasida `authorize(...)` preHandler.
6. **RED zonani o'chirish** — faqat SUPERADMIN.

## Keyingi qadamlar (roadmap)

1. **PostGIS** — poligonlarni geometriya tipida saqlash, `ST_Contains` bilan tekshiruv.
2. **Email/SMS** — OTP yuborish (SMTP/Playmobile), parolni tiklash.
3. **Sertifikat** — kurs yakunida PDF + QR tekshiruv sahifasi.
4. **Realtime** — WebSocket/MQTT orqali telemetriya va Remote ID.
5. **Ruxsatnoma workflow** — YELLOW zona uchun ariza va moderator tasdiqlash.
6. **To'lovlar** — Payme/Click integratsiyasi (do'kon/akademiya).
7. **Mobil** — Flutter ilova (API allaqachon tayyor).
8. **CI/CD** — GitHub Actions: lint, typecheck, test, deploy (Railway/VPS).
9. **Monitoring** — Sentry + Prometheus metrikalar.
10. **httpOnly cookie** — tokenni XSS'dan himoyalash uchun web auth'ni cookie'ga o'tkazish.
