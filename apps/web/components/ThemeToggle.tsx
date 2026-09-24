"use client";

const STORAGE_KEY = "dronchi-theme";

function applyTheme(next: "dark" | "light"): void {
  const root = document.documentElement;
  root.classList.toggle("light", next === "light");

  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage mavjud bo'lmasa — jim o'tamiz
  }

  document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Kunduzgi/tungi mavzu tugmasi.
 * Holat React'da saqlanmaydi — `html.light` klassi bilan boshqariladi
 * (shu sababli hydration xatosi va "miltillash" bo'lmaydi).
 */
export default function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const isLight = document.documentElement.classList.contains("light");
    applyTheme(isLight ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Mavzuni almashtirish (kunduzgi / tungi)"
      title="Mavzuni almashtirish"
      className={className ? `theme-toggle ${className}` : "theme-toggle"}
    >
      {/* Tungi rejimda — quyosh (kunduzgiga o'tish), kunduzgi rejimda — oy */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="hidden h-[18px] w-[18px] light:block"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="block h-[18px] w-[18px] light:hidden"
        aria-hidden="true"
      >
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
