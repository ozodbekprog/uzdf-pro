/** Ilova tablari (App.tsx navigatsiyasi bilan umumiy). */
export type MobileTab = "home" | "academy" | "zones" | "shop" | "cabinet";

export const TAB_LABELS: Record<MobileTab, string> = {
  home: "Asosiy",
  academy: "Akademiya",
  zones: "Xarita",
  shop: "Do'kon",
  cabinet: "Kabinet"
};

/** Ekranlar orasidagi qo'shimcha marshrutlar (tab emas). */
export type MobileRoute =
  | { name: "course"; slug: string }
  | { name: "news" }
  | { name: "newsDetail"; slug: string };
