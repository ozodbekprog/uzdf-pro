/**
 * DRONCHI mobil ilovasi — mavzu (sayt bilan bir xil: to'q ko'k + emerald/cyan).
 */

export const theme = {
  colors: {
    bg: "#050a17",
    surface: "#0a1020",
    surfaceAlt: "#111c33",
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
  radius: { sm: 10, md: 14, lg: 20, pill: 999 },
  space: (n: number): number => n * 4
} as const;

export type Theme = typeof theme;
