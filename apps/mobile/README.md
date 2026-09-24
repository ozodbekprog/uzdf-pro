# DRONCHI / UZDF Pro — mobil ilova (Expo)

**Oxirgi yangilangan:** 2026-09-24

Bu hujjat `apps/mobile` papkasidagi Expo mobil ilovasi haqida. Hujjat to'liq kod
fayllaridan (`App.tsx`, `app.json`, `src/*`) olingan ma'lumot asosida yozilgan.

---

## 1. Kirish

**DRONCHI (UZDF Pro)** — BPLA (dron) uchuvchilari uchun platformaning mobil
ilovasi. Ilova web sayt bilan bir xil backend bilan ishlaydi: geozonalarni
ko'rish va nuqtani tekshirish, Akademiyadan darslarni o'qish va EXP yig'ish,
shaxsiy kabinet (statistika, daraja, progress).

- **Ilova nomi:** `UZDF Pro` (`app.json`)
- **Slug:** `uzdfpro`
- **Bundle / Package:** `pro.uzdf.app` (iOS + Android)
- **Standart (jonli) API manzili:** `https://dronchi-api.vercel.app`
  (kodda `src/api.ts` → `DEFAULT_API_URL`)
- **API-klient izohi:** "Web bilan bir xil Fastify API" (`src/api.ts`)

---

## 2. Talablar

| Talab | Tafsilot |
| --- | --- |
| Node.js | **20+** (repo ildizidagi `engines.node` = `>=20`) |
| Telefon | **Expo Go** ilovasi (App Store / Play Market) |
| Tarmoq | Telefon va kompyuter **bitta Wi-Fi** tarmoqda bo'lishi kerak (`--lan` rejimi uchun) |
| Xcode | **SHART EMAS** — ilova Expo Go orqali ishlaydi |

> Eslatma: ilova standart holatda jonli (Vercel) API'ga ulanadi, shuning uchun
> lokal API ishga tushirish shart emas. Faqat QR kod skanerlash uchun telefon va
> kompyuter bir tarmoqda bo'lsa kifoya.

---

## 3. Ishga tushirish

```bash
cd apps/mobile
npm install
npx expo start --lan
```

Yoki repo ildizidan:

```bash
npm run dev:mobile
```

Keyin:

1. Terminalda chiqqan **QR kodni** telefonda **Expo Go** ilovasi bilan skanerlang.
2. QR ishlamasa, `exp://<kompyuter-IP>:8081` manzilini Expo Go'ga qo'lda kiriting.
3. **Xcode / Android Studio SHART EMAS** — kod Expo Go ichida ishlaydi.

Foydali skriptlar (`package.json`):

| Skript | Vazifa |
| --- | --- |
| `npm start` | `expo start --lan` |
| `npm run android` | `expo run:android` (lokal native build) |
| `npm run ios` | `expo run:ios` (lokal native build) |
| `npm run web` | `expo start --web` |
| `npm run typecheck` | `tsc --noEmit` |

---

## 4. Ekranlar jadvali

`src/navigation.ts` ilova tuzilmasini belgilaydi: 5 ta tab (`home`, `academy`,
`zones`, `shop`, `cabinet`) va qo'shimcha marshrutlar (`course`, `news`,
`newsDetail`). Joriy holatda `App.tsx` faqat **3 ta tabni** ulaydi
(Akademiya, Xarita, Kabinet); qolgan ekranlar interfeysi `navigation.ts` va
`api.ts` da e'lon qilingan, ammo alohida `src/screens/*.tsx` fayli hali yo'q.

| Ekran | Fayl / Manba | Vazifa | Holat |
| --- | --- | --- | --- |
| **Asosiy** | `navigation.ts` (`home`), `getDashboard()` | Bosh sahifa: umumiy ko'rsatkichlar, kurslar progressi | Reja (tab e'lon qilingan) |
| **Akademiya** | `src/screens/AcademyScreen.tsx` | Kurslar ro'yxati, darslar, video ochish, "Yakunlash (+EXP)" | ✅ Ishlaydi |
| **Kurs** | `AcademyScreen.tsx` (`detail`), `getCourse(slug)` | Bitta kurs tafsiloti va darslari | ✅ Akademiya ichida |
| **Xarita** | `src/screens/ZonesScreen.tsx` | Geozonalar ro'yxati, lat/lng nuqtani tekshirish, API manzili | ✅ Ishlaydi |
| **Do'kon** | `navigation.ts` (`shop`), `getProducts()`, `createOrder()` | Mahsulotlar va buyurtma berish | Reja (tab e'lon qilingan) |
| **Yangiliklar** | `navigation.ts` (`news`), `getNews()` | Yangiliklar ro'yxati | Reja (marshrut e'lon qilingan) |
| **Yangilik tafsiloti** | `navigation.ts` (`newsDetail`), `getNewsItem(slug)` | Bitta yangilik matni | Reja (marshrut e'lon qilingan) |
| **Kabinet** | `src/screens/CabinetScreen.tsx` | Profil, EXP, daraja, statistika, chiqish | ✅ Ishlaydi |
| **Kirish** | `CabinetScreen.tsx` (login rejimi), `login()` | Email/parol bilan kirish va OTP orqali ro'yxatdan o'tish | ✅ Kabinet ichida |

### Amaldagi tablar (`App.tsx`)

| Tab ID | Yorliq | Komponent |
| --- | --- | --- |
| `zones` | Xarita | `ZonesScreen` |
| `academy` | Akademiya | `AcademyScreen` |
| `cabinet` | Kabinet | `CabinetScreen` |

---

## 5. API manzilini almashtirish

Ikki usul mavjud:

1. **Ilova ichidan** — **Xarita** ekranidagi **«API manzili»** kartasi:
   yangi manzilni kiriting → **«Saqlash va qayta ulash»** tugmasini bosing.
   Qiymat `AsyncStorage` da `uzdfpro.apiUrl` kaliti bilan saqlanadi va keyingi
   ishga tushirishlarda eslab qolinadi (`src/api.ts` → `getApiUrl` / `setApiUrl`).

2. **Kod orqali (standart qiymat)** — `src/api.ts` faylidagi `DEFAULT_API_URL`:

   ```ts
   export const DEFAULT_API_URL = "https://dronchi-api.vercel.app";
   ```

> Diqqat: manzil oxiridagi `/` belgisi avtomatik olib tashlanadi (`setApiUrl`).
> Telefon va kompyuter bir Wi-Fi da bo'lmasa, lokal `http://<IP>:4000` manzili
> ishlamasligi mumkin.

---

## 6. Sinov akkauntlari

Jonli baza uchun:

| Rol | Email | Parol |
| --- | --- | --- |
| Pilot | `pilot@uzdf.pro` | `Dronchi-Pilot-2026!` |
| Admin | `admin@uzdf.pro` | `Dronchi-Admin-2026!` |

> **Eslatma:** bu akkauntlar **umumiy sinov** uchun. Ularni umumiy loyihalarda,
> ochiq muhitlarda yoki productionda ishlatmang.
>
> Ilovadagi kirish formasi standart holatda `pilot@uzdf.pro` va `Pilot123!`
> qiymatlari bilan oldindan to'ldirilgan (`CabinetScreen.tsx`, dev qiymati).
> Jonli baza uchun yuqoridagi parolni kiriting.

Kirish va ro'yxatdan o'tish:

- **Kirish** — email + parol (`POST /api/v1/auth/login`).
- **Ro'yxatdan o'tish** — F.I.Sh + email + parol, so'ng **email OTP** kodini
  kiritib tasdiqlash (`/api/v1/auth/register` → `/api/v1/auth/verify-email`).
- Tokенlar `uzdfpro.tokens` kaliti bilan `AsyncStorage` da saqlanadi.

---

## 7. Arxitektura

```
apps/mobile/
├── App.tsx                     # Ilova qobig'i: sarlavha + tab navigatsiyasi
├── index.js                    # registerRootComponent(App)
├── app.json                    # Expo konfiguratsiya (nom, slug, bundle id)
├── package.json                # Skriptlar va bog'liqliklar
└── src/
    ├── api.ts                  # API-klient, tiplar, auth va barcha endpointlar
    ├── theme.ts                # Mavzu: ranglar, radius, oraliq
    ├── navigation.ts           # Tab va marshrut ta'riflari
    ├── components/
    │   └── ui.tsx              # UI to'plami (Card, Button, Input, ...)
    └── screens/
        ├── AcademyScreen.tsx   # Akademiya
        ├── CabinetScreen.tsx   # Kabinet / Kirish
        └── ZonesScreen.tsx     # Xarita / geozonalar
```

### `src/api.ts` — API-klient

Web bilan bir xil `fetch` asosidagi klient. Muhim qismlari:

- `DEFAULT_API_URL`, `getApiUrl()`, `setApiUrl()` — manzilni boshqarish.
- `api<T>(path, options, auth)` — umumiy so'rov; `auth = true` bo'lsa
  `Authorization: Bearer <accessToken>` qo'shiladi; bo'sh body'da
  `content-type` yuborilmaydi.
- Tokенlar: `getTokens` / `setTokens` / `clearTokens` / `isLoggedIn`.

**Endpointlar (kodda mavjud):**

| Bo'lim | Funksiyalar |
| --- | --- |
| Auth | `login`, `registerUser`, `verifyEmail`, `logout`, `getMe` |
| Zonalar | `getZones`, `checkZone(lat, lng)` |
| Akademiya | `getCourses`, `getCourse(slug)`, `completeLesson` |
| Dashboard | `getDashboard` |
| O'quv jarayoni | `startLesson`, `getProgress` |
| Testlar | `getLessonQuiz`, `submitQuiz` |
| Yangiliklar | `getNews`, `getNewsItem(slug)` |
| Do'kon | `getProducts`, `createOrder`, `getMyOrders` |
| Sertifikat/Reyting | `getMyCertificates`, `getRating` |

### `src/theme.ts` — ranglar

To'q ko'k fon (`#050a17`) + emerald/cyan urg'u. Asosiy kalitlar:
`primary` `#34d399`, `accent` `#22d3ee`, `danger`/`red` `#f87171`,
`warning`/`yellow` `#fbbf24`, `bg`, `surface`, `text`, `muted`, `dim`.
`radius` (`sm`/`md`/`lg`/`pill`) va `space(n)` yordamchisi ham mavjud.

### `src/components/ui.tsx` — UI to'plami

Tuzilma: `Card`, `Screen`, `Row`, `Divider`.
Matn: `H1`, `H2`, `H3`, `Body`, `Muted`, `ErrorText`.
Elementlar: `Badge`, `Button` (`primary`/`secondary`/`ghost`/`danger`),
`Input`, `Field`, `ProgressBar`, `EmptyState`, `Loader`, `Skeleton`.
Yordamchilar: `zoneColor(type)` (RED/YELLOW/GREEN), `formatSom(value)`,
`formatDate(iso)`. Eski nom bilan moslik uchun `colors` ham eksport qilinadi.

### `src/navigation.ts` — tablar va marshrutlar

- **Tablar:** `home` (Asosiy), `academy` (Akademiya), `zones` (Xarita),
  `shop` (Do'kon), `cabinet` (Kabinet).
- **Qo'shimcha marshrutlar:** `{ name: "course", slug }`, `{ name: "news" }`,
  `{ name: "newsDetail", slug }`.

### `src/screens/*`

- **`ZonesScreen.tsx`** — API manzilini ko'rsatadi/tahrirlaydi, geozonalar
  ro'yxatini yuklaydi, lat/lng bo'yicha nuqtani tekshiradi (`checkZone`).
- **`AcademyScreen.tsx`** — kurslar ro'yxati; kursni ochganda darslar,
  video havolasi va «Yakunlash (+EXP)» tugmasi (`completeLesson`).
- **`CabinetScreen.tsx`** — login/registratsiya, OTP tasdiqlash, profil,
  EXP/daraja/statistika (`getMe`, `getDashboard`), chiqish.

---

## 8. Keyingi qadamlar

- **Xcode bilan lokal build** — `npm run ios` / `npm run android` orqali native
  build (`expo run:ios`, `expo run:android`).
- **EAS Build + TestFlight** — `eas build` bilan bulutda build qilib, TestFlight
  orqali tarqatish. Buning uchun **Apple Developer akkaunti** kerak.
- **Native xarita** — `react-native-maps` qo'shib, geozonalarni haqiqiy xarita
  ustida ko'rsatish (hozir nuqta faqat lat/lng orqali tekshiriladi).
- **Qolgan ekranlar** — `navigation.ts` da e'lon qilingan `home`, `shop`, `news`
  ekranlarini `src/screens/` ga qo'shib, `App.tsx` navigatsiyasiga ulash
  (kerakli API funksiyalari `src/api.ts` da tayyor).

---

## Aloqador hujjatlar

- Repo ildizidagi `DEPLOY.md` — API (`apps/api`) va web (`apps/web`) ni
  Vercel + Neon'ga joylash. Mobil ilova jonli API URL'iga ulanadi.
