"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getMe, getTokens, logout, type PublicUser } from "@/lib/api";

function Icon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5a3 3 0 0 0 3 5M16 6h3a3 3 0 0 1-3 5" />
          <path d="M12 13v4M9 20h6" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="18" cy="20" r="1.3" />
          <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16h8.3a2 2 0 0 0 1.95-1.55L21 8H6" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2V4Z" />
          <path d="M18 8h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1M8 8h7M8 12h7M8 16h4" />
        </svg>
      );
    default:
      return null;
  }
}

const NAV_GROUPS: Array<{
  title: string;
  items: Array<{ href: string; label: string; icon: string }>;
}> = [
  {
    title: "O'qish",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "grid" },
      { href: "/my-courses", label: "Mening kurslarim", icon: "book" },
      { href: "/academy", label: "Akademiya", icon: "book" },
      { href: "/certificates", label: "Sertifikatlar", icon: "award" },
      { href: "/rating", label: "Reyting", icon: "trophy" },
    ],
  },
  {
    title: "Ekotizim",
    items: [
      { href: "/zones", label: "Poligonlar xaritasi", icon: "map" },
      { href: "/shop", label: "Do'kon", icon: "cart" },
      { href: "/news", label: "Yangiliklar", icon: "news" },
    ],
  },
  {
    title: "Boshqaruv",
    items: [{ href: "/admin", label: "Admin panel", icon: "shield" }],
  },
];

const ROLE_LABEL: Record<string, string> = {
  PILOT: "Uchuvchi",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
  SUPERADMIN: "Superadmin",
};

const ROUTE_TITLES: Array<{ match: string; title: string }> = [
  { match: "/dashboard", title: "Dashboard" },
  { match: "/my-courses", title: "Mening kurslarim" },
  { match: "/academy", title: "Akademiya" },
  { match: "/certificates", title: "Sertifikatlar" },
  { match: "/rating", title: "Reyting" },
  { match: "/zones", title: "Poligonlar xaritasi" },
  { match: "/shop", title: "Do'kon" },
  { match: "/news", title: "Yangiliklar" },
  { match: "/admin", title: "Admin panel" },
];

function levelOf(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    if (!getTokens()) return;
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const level = user ? levelOf(user.exp) : 1;
  const inLevel = user ? user.exp % 100 : 0;
  const initials = user ? initialsOf(user.fullName) : "D";
  const pageTitle =
    ROUTE_TITLES.find((item) => pathname.startsWith(item.match))?.title ?? "Kabinet";

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div className="relative flex items-center gap-2.5 px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-sm font-extrabold text-[#04121f] shadow-[0_12px_32px_-14px_rgba(52,211,153,0.95)]">
            D
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-white">
            DRON<span className="gradient-text">CHI</span>
          </span>
        </Link>
      </div>

      <nav className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-600">
              {group.title}
            </span>
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "card-hover group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm",
                    active
                      ? "bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-transparent text-white ring-1 ring-inset ring-emerald-400/25"
                      : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  {active ? (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-emerald-300 to-cyan-400" />
                  ) : null}
                  <span
                    className={cn(
                      "transition-colors",
                      active ? "text-emerald-300" : "text-neutral-500 group-hover:text-emerald-300"
                    )}
                  >
                    <Icon name={item.icon} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="relative border-t border-white/[0.06] p-3.5">
        <div className="glass-strong rounded-2xl p-3.5">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-[#04121f] shadow-[0_12px_32px_-14px_rgba(52,211,153,0.95)]">
                  {initials}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-white">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs text-neutral-500">{user.email}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
                <span className="font-semibold text-emerald-400">
                  Lv {level} · {user.exp} EXP
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                    style={{ width: `${inLevel}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-neutral-500">{inLevel}%</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500">Yuklanmoqda...</p>
          )}

          <button
            onClick={handleLogout}
            className={buttonClasses({
              variant: "secondary",
              size: "sm",
              className: "mt-3 w-full",
            })}
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#050a17]">
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-72 md:block">{sidebar}</aside>

      <header className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-sm font-extrabold text-[#04121f]">
            D
          </span>
          <span className="font-display text-sm font-extrabold tracking-tight text-white">
            DRON<span className="gradient-text">CHI</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menyu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-neutral-300 transition hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {open ? (
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Yopish"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong absolute inset-y-0 left-0 w-72 shadow-2xl shadow-black/50">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="md:pl-72">
        <div className="glass sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 px-5 md:flex">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-sm font-bold text-white">
              {pageTitle}
            </span>
            <span className="text-[11px] text-neutral-500">
              DRONCHI · aviatsiya ekotizimi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="glass hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-500 lg:flex">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" />
              </svg>
              <input
                type="search"
                placeholder="Kurs, yangilik qidirish..."
                className="w-52 bg-transparent text-neutral-200 placeholder:text-neutral-500 outline-none"
              />
            </label>

            <button
              type="button"
              aria-label="Bildirishnomalar"
              className="glass relative grid h-10 w-10 place-items-center rounded-xl text-neutral-400 transition hover:text-white"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
                <path d="M13.7 20a2 2 0 0 1-3.4 0" />
              </svg>
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-400 pulse-glow" />
            </button>

            <Link
              href="/dashboard"
              className="glass-strong flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition hover:brightness-110"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[11px] font-bold text-[#04121f]">
                {initials}
              </span>
              <span className="flex flex-col text-left leading-tight">
                <span className="max-w-28 truncate text-xs font-semibold text-white">
                  {user?.fullName ?? "Mehmon"}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {user ? `Lv ${level} · ${user.exp} EXP` : "—"}
                </span>
              </span>
            </Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
