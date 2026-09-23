# UZDF Pro — mobil ilova (Expo)

Web saytning mobil versiyasi. Xuddi shu Fastify API bilan ishlaydi.

## Talablar

- Kompyuterda: API ishga tushgan bo'lsin (`npm run dev:api`, port 4000)
- Telefonda: **Expo Go** ilovasi (Play Market / App Store)
- Telefon va kompyuter **bitta Wi-Fi** tarmoqda bo'lsin

## Ishga tushirish

```bash
npm run dev:mobile   # repo ildizidan (apps/mobile ichida: npm start)
```

Terminal'da QR-kod chiqadi — uni Expo Go orqali skanerlang.
QR ishlamasa, `exp://192.168.x.x:8081` manzilini Expo Go'ga qo'lda kiriting.

## Sozlash

Ilova ichida **Xarita** ekranida API manzili bor:
- Standart: `http://190.191.13.156:4000`
- Agar Wi-Fi IP farq qilsa, kompyuter IP'sini yozing: `http://<kompyuter-IP>:4000`

## Demo

- Pilot: `pilot@uzdf.pro` / `Pilot123!`
- Admin (web'da): `admin@uzdf.pro` / `Admin123!`

## Ekranlar

- **Xarita** — geozonalar ro'yxati + nuqta tekshiruvi (lat/lng)
- **Akademiya** — kurslar, darslar, video, yakunlash (+EXP)
- **Kabinet** — kirish / OTP bilan ro'yxatdan o'tish, EXP, daraja, progress
