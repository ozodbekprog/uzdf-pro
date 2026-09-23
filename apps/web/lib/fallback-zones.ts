// DB o'chiq bo'lganda ham xarita bo'sh qolmasligi uchun o'rnatilgan poligonlar.
// Faqat asl 3 ta zona: seed.ts dagi bilan bir xil koordinatalar.
// DB yonib seed ishga tushishi bilan API ma'lumoti buni almashtiradi.
import type { Zone } from "./api";

type LatLng = [number, number];

const poly = (name: string, description: string, type: Zone["type"], polygon: LatLng[], id: string): Zone => ({
  id,
  name,
  type,
  description,
  polygon,
  active: true,
});

export const FALLBACK_ZONES: Zone[] = [
  poly(
    "Toshkent xalqaro aeroporti (taqiqlangan)",
    "Aeroport atrofida uchish qat'iyan taqiqlanadi",
    "RED",
    [
      [41.272, 69.25],
      [41.272, 69.318],
      [41.242, 69.318],
      [41.242, 69.25],
    ],
    "demo-red-airport"
  ),
  poly(
    "Toshkent markazi (cheklangan)",
    "Uchish uchun oldindan ruxsat olish talab qilinadi",
    "YELLOW",
    [
      [41.36, 69.2],
      [41.36, 69.36],
      [41.24, 69.36],
      [41.24, 69.2],
    ],
    "demo-yellow-center"
  ),
  poly(
    "Chirchiq o'quv poligoni",
    "O'quv va mashq parvozlari uchun erkin zona",
    "GREEN",
    [
      [41.52, 69.54],
      [41.52, 69.66],
      [41.44, 69.66],
      [41.44, 69.54],
    ],
    "demo-green-chirchiq"
  ),
];
