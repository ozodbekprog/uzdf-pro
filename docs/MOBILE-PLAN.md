# DRONCHI mobil ilova — reja va mas'uliyat taqsimoti

## 1. Asosiy tamoyil: bitta kod bazasi

Ilova **Expo / React Native** da yozilgan. Bu shuni bildiradi:

> iOS va Android uchun kod **~95% bir xil**. Bitta repo, bitta `src/`, bitta dizayn tizimi.

Shuning uchun "biz iOS, boshqalar Android" deb **platforma bo'yicha** bo'lish samarasiz:
ikkita kod bazasi paydo bo'ladi, ular tez orada bir-biridan uzoqlashib ketadi va
har bir yangilikni ikki marta yozishga to'g'ri keladi.

**To'g'ri yo'l — mas'uliyat bo'yicha bo'lish:**

| Yo'nalish | Kim | Nima |
|---|---|---|
| **Umumiy kod** (`src/screens`, `src/api.ts`, `src/theme.ts`, `src/components`) | Biz | Barcha ekranlar, logika, dizayn — ikkala platformaga birga |
| **iOS** | Biz | iOS build, TestFlight, App Store, iOS-specific sozlamalar |
| **Android** | Ikkinchi jamoa | Android build, Play Store, Android-specific sozlamalar |
| **API** | Biz | `apps/api` — ikkala ilova ham shu API dan foydalanadi |

Ya'ni: ikkinchi jamoa **umumiy kodga ham hissa qo'shadi**, lekin asosiy mas'uliyati —
Android platformasi (build, store, qurilma testlari).

## 2. Hozirgi holat (tayyor)

| Nima | Holat |
|---|---|
| 9 ekran (Kirish, Asosiy, Xarita, Akademiya, Kurs, Yangiliklar ×2, Do'kon, Kabinet) | ✅ |
| Dizayn tizimi (`theme.ts`, `ui.tsx`) | ✅ |
| To'liq API klient (auth, kurslar, testlar, yangiliklar, do'kon, sertifikat, reyting) | ✅ |
| Jonli API ulanishi (`https://dronchi-api.vercel.app`) | ✅ |
| Ilova ikonkasi, splash, adaptive icon | ✅ |
| `app.json` (iOS bundle id: `pro.dronchi.app`, Android: `pro.dronchi.app`) | ✅ |
| `eas.json` (development / preview / production build profillari) | ✅ |
| Typecheck: 0 xato | ✅ |
| Expo Go orqali telefonda sinash | ✅ |

## 3. Fayl egaligi (konflikt bo'lmasligi uchun)

```
apps/mobile/
  App.tsx                 -> BIZ (navigatsiya markazi)
  src/theme.ts            -> BIZ
  src/components/ui.tsx   -> BIZ
  src/api.ts              -> BIZ (API kontrakti o'zgarsa — PR bilan)
  src/navigation.ts       -> BIZ
  src/screens/*.tsx       -> ekran egasiga qarab (quyida)
  app.json, eas.json      -> BIZ
  assets/*                -> BIZ
```

**Qoida:** har bir o'zgarish alohida branch + Pull Request bilan. `main` ga to'g'ridan-to'g'ri
push qilinmaydi. PR'da `npm run typecheck` (mobile) yashil bo'lishi shart.

| Ekran | Egasi |
|---|---|
| `LoginScreen`, `HomeScreen`, `CabinetScreen`, `CourseScreen`, `ZonesScreen` | Biz |
| `ShopScreen`, `NewsScreen`, `NewsDetailScreen`, `AcademyScreen` | Ikkinchi jamoa (Android) — ikkala platformaga ham ishlaydi |

## 4. iOS build yo'li

> Lokal kompyuterda **Xcode shart emas** — build bulutda (EAS) bajariladi.

### Kerak bo'ladi
1. **Apple Developer Program** — `$99/yil` (app.apple.com → Enroll). Bu **majburiy**:
   TestFlight va App Store uchun akkauntsiz ilova tarqatib bo'lmaydi.
2. **Expo akkaunt** — bepul (expo.dev/signup).
3. EAS CLI (`npx eas-cli` — o'rnatish shart emas).

### Qadamlar
```bash
cd apps/mobile
npx eas-cli login                 # Expo akkaunt
npx eas-cli init                  # projectId ni app.json ga qo'shadi
npx eas-cli build --platform ios --profile preview     # ichki test uchun (.ipa)
npx eas-cli submit --platform ios --profile production # App Store Connect ga
```

`preview` profili — qurilmalarga to'g'ridan-to'g'ri o'rnatish uchun (Apple UDID ro'yxati bilan).
`production` — App Store / TestFlight uchun.

## 5. Android build yo'li (ikkinchi jamoa)

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview      # .apk (test)
npx eas-cli build --platform android --profile production   # .aab (Play Store)
npx eas-cli submit --platform android --profile production
```

- **Google Play Console** — `$25` (bir marta to'lanadi).
- Android-specific: adaptive icon, edge-to-edge rejim, back gesture, notification kanallari.

## 6. Xarajatlar

| Xizmat | Narx |
|---|---|
| Expo / EAS (bepul tarif) | $0 |
| Apple Developer Program | $99 / yil |
| Google Play Console | $25 (bir marta) |
| Vercel (sayt + API) | $0 (hozircha bepul tarif) |
| Neon PostgreSQL | $0 (bepul tarif) |

## 7. Test rejimi (akkauntsiz)

Apple akkaunti olinmaguncha ilovani **Expo Go** orqali sinash mumkin:

```bash
cd apps/mobile
npx expo start --lan
```
QR kodni Expo Go ilovasi bilan skanerlash. Bu **haqiqiy qurilmada** ishlaydi va
App Store tekshiruvidan o'tmaydi.

## 8. Keyingi qadamlar

- [ ] Expo akkaunt yaratish (bepul) va `eas-cli login`
- [ ] Apple Developer Program ga ariza berish ($99/yil) — iOS tarqatish uchun
- [ ] Google Play Console akkaunti (Android jamoasi uchun)
- [ ] Native xarita (`react-native-maps`) qo'shish — hozir zonalar ro'yxati + koordinata tekshiruvi
- [ ] Push bildirishnomalar (yangi dars / buyurtma holati)
- [ ] Offline rejim (darslarni keshlash)
