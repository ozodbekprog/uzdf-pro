/**
 * DRONCHI mobil ilovasi — mavzu (sayt bilan bir xil: to'q ko'k + emerald/cyan).
 */

export const theme = {
  colors: {
    bg: "#050a17",
    surface: "#0a1020",
    surfaceAlt: "#111c33",
    surfaceRaised: "#13203a",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.16)",
    text: "#e8eefc",
    muted: "#8b9ab5",
    dim: "#5c6a85",
    primary: "#34d399",
    primaryDark: "#10b981",
    accent: "#22d3ee",
    warning: "#fbbf24",
    danger: "#f87171",
    success: "#34d399",
    red: "#f87171",
    yellow: "#fbbf24",
    green: "#34d399",
    white: "#ffffff"
  },
  /** Burchak radiuslari (mavjudlari saqlangan, yangilari qo'shilgan). */
  radius: { xs: 6, sm: 10, md: 14, card: 18, lg: 20, xl: 24, xxl: 28, pill: 999 },
  space: (n: number): number => n * 4,
  /**
   * Gradient juftliklari: [boshlanish, tugash].
   * RN'da `expo-linear-gradient` kabi kutubxona YO'Q — shuning uchun ranglar
   * massiv ko'rinishida saqlanadi va kerak bo'lganda fon/aksiya uchun ishlatiladi.
   */
  gradients: {
    primary: ["#34d399", "#22d3ee"],
    primaryDeep: ["#10b981", "#0891b2"],
    mint: ["#6ee7b7", "#34d399"],
    cyan: ["#22d3ee", "#0ea5e9"],
    surface: ["#13203a", "#0a1020"],
    card: ["#152441", "#0b1326"]
  },
  /**
   * Soyalar: iOS uchun `shadow*`, Android uchun `elevation`.
   * `as const` sababli faqat o'qish uchun, lekin RN uslublariga spread qilsa bo'ladi.
   */
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0
    },
    sm: {
      shadowColor: "#000000",
      shadowOpacity: 0.25,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2
    },
    md: {
      shadowColor: "#000000",
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5
    },
    lg: {
      shadowColor: "#000000",
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 9
    },
    glow: {
      shadowColor: "#34d399",
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6
    }
  }
} as const;

export type Theme = typeof theme;
