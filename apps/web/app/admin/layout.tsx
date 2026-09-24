"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Alert from "@/components/ui/Alert";
import { buttonClasses } from "@/components/ui/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";
import { getMe, logout, type PublicUser } from "@/lib/api";
import { useIsAuthed } from "@/lib/auth-store";

const MANAGER_ROLES = ["MODERATOR", "ADMIN", "SUPERADMIN"];

type AdminRole = "MODERATOR" | "ADMIN" | "SUPERADMIN";

const NAV: Array<{
  group: string;
  items: Array<{ href: string; label: string; icon: string; roles: AdminRole[] }>;
}> = [
  {
    group: "Boshqaruv",
    items: [
      { href: "/admin", label: "Umumiy holat", icon: "grid", roles: ["MODERATOR", "ADMIN", "SUPERADMIN"] },
      { href: "/admin/users", label: "Foydalanuvchilar", icon: "users", roles: ["ADMIN", "SUPERADMIN"] },
      { href: "/admin/certificates", label: "Sertifikatlar", icon: "award", roles: ["ADMIN", "SUPERADMIN"] },
    ],
  },
  {
    group: "Kontent",
    items: [
      { href: "/admin/courses", label: "Kurslar va darslar", icon: "book", roles: ["ADMIN", "SUPERADMIN"] },
      { href: "/admin/quizzes", label: "Testlar", icon: "quiz", roles: ["ADMIN", "SUPERADMIN"] },
      { href: "/admin/news", label: "Yangiliklar", icon: "news", roles: ["ADMIN", "SUPERADMIN"] },
    ],
  },
  {
    group: "Savdo",
    items: [
      { href: "/admin/products", label: "Mahsulotlar", icon: "cart", roles: ["ADMIN", "SUPERADMIN"] },
      { href: "/admin/orders", label: "Buyurtmalar", icon: "box", roles: ["MODERATOR", "ADMIN", "SUPERADMIN"] },
    ],
  },
  {
    group: "Xarita",
    items: [
      { href: "/admin/zones", label: "Geozonalar", icon: "map", roles: ["MODERATOR", "ADMIN", "SUPERADMIN"] },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  PILOT: "Uchuvchi",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
  SUPERADMIN: "Superadmin",
};

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    className: className ?? "h-[18px] w-[18px]",
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
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M16 11.2a3 3 0 1 0 0-6M17.5 20a5.6 5.6 0 0 0-2-4.3" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3M12 17h.01" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2V4Z" />
          <path d="M18 8h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1M8 8h7M8 12h7M8 16h4" />
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
    case "box":
      return (
        <svg {...common}>
          <path d="M21 8.5 12 4 3 8.5v7L12 20l9-4.5v-7Z" />
          <path d="M3 8.5 12 13l9-4.5M12 13v7" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M14.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3.5" />
          <path d="M10 12H3M6.5 8 2.5 12l4 4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authed = useIsAuthed();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const me = await getMe();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setChecked(true);
      }
    }

    void check();
    return () => {
      active = false;
    };
  }, []);

  if (!checked) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center gap-3 px-6 py-24 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-amber-400" />
        Tekshirilmoqda...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-20">
        <Alert tone="warning">
          Admin panelga kirish uchun tizimga kiring.
        </Alert>
        <Link href="/login" className={buttonClasses({ className: "self-start" })}>
          Kirish sahifasiga o&apos;tish
        </Link>
      </div>
    );
  }

  if (!user || !MANAGER_ROLES.includes(user.role)) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-20">
        <Alert tone="error">
          Sizda admin panelga kirish huquqi yo&apos;q. Faqat MODERATOR va undan yuqori
          rollar kira oladi.
        </Alert>
        <div className="flex gap-3">
          <Link href="/dashboard" className={buttonClasses({ variant: "secondary" })}>
            Kabinetga qaytish
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className={buttonClasses({ variant: "ghost" })}
          >
            Boshqa akkaunt bilan kirish
          </button>
        </div>
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-16 h-52 w-52 rounded-full bg-amber-500/20 blur-3xl"
      />

      <div className="relative flex items-center px-5 pb-5 pt-6">
        <Link href="/admin" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-400 font-display text-base font-black text-[#0b0f14] shadow-lg shadow-amber-500/30 ring-1 ring-inset ring-white/25 transition-transform group-hover:scale-105">
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-sm font-bold tracking-tight text-white">
              DRON
              <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
                CHI
              </span>
              <span className="ml-1 text-amber-300/90">Admin</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              boshqaruv paneli
            </span>
          </span>
        </Link>
      </div>

      <nav className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => {
          const items = group.items.filter((item) =>
            (item.roles as string[]).includes(user.role)
          );
          if (items.length === 0) return null;
          return (
            <div key={group.group} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                {group.group}
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </span>
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "card-hover bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent font-semibold text-white ring-1 ring-inset ring-amber-400/25"
                        : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                    ) : null}
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        active
                          ? "text-amber-300"
                          : "text-neutral-500 group-hover:text-neutral-300"
                      )}
                    >
                      <Icon name={item.icon} />
                    </span>
                    <span className="truncate">{item.label}</span>
                    {active ? (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="relative p-4">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-400 font-display text-sm font-bold text-[#0b0f14] shadow-lg shadow-amber-500/25 ring-1 ring-inset ring-white/25">
              {initials}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-white">
                {user.fullName}
              </span>
              <span className="truncate text-xs text-neutral-500">{user.email}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-neutral-400 transition hover:text-white"
            >
              Saytga qaytish
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className: "flex-1",
              })}
            >
              <Icon name="logout" className="h-3.5 w-3.5" />
              Chiqish
            </button>
            <ThemeToggle className="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-dvh bg-[#050a17] text-[#eaf1ff]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-72 border-r-white/10 md:block">
        {sidebar}
      </aside>

      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-400 font-display text-sm font-black text-[#0b0f14] shadow-lg shadow-amber-500/25 ring-1 ring-inset ring-white/25">
            A
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-white">
            DRON
            <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
              CHI
            </span>
            <span className="ml-1 text-amber-300/90">Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menyu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:border-amber-400/40 hover:text-heading"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {open ? (
                <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Yopish"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong absolute inset-y-0 left-0 w-72 border-r-white/10">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="relative z-10 md:pl-72">{children}</main>
    </div>
  );
}
