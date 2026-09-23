"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Alert from "@/components/ui/Alert";
import { buttonClasses } from "@/components/ui/Button";
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
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 text-center text-sm text-neutral-500">
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

  const sidebar = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/20">
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-white">
              DRONCHI Admin
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80">
              boshqaruv paneli
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => {
          const items = group.items.filter((item) =>
            (item.roles as string[]).includes(user.role)
          );
          if (items.length === 0) return null;
          return (
            <div key={group.group} className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                {group.group}
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-gradient-to-r from-amber-500/15 to-transparent text-white ring-1 ring-inset ring-amber-400/25"
                      : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {active ? (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-amber-400" />
                  ) : null}
                  <span className={cn(active ? "text-amber-400" : "text-neutral-500")}>
                    <Icon name={item.icon} />
                  </span>
                  {item.label}
                </Link>
              );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-neutral-950">
              {user.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-white">{user.fullName}</span>
              <span className="truncate text-xs text-neutral-500">{user.email}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-300">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            <Link href="/" className="text-neutral-400 transition hover:text-white">
              Saytga qaytish →
            </Link>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
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
    <div className="min-h-dvh bg-[#0a0a0f]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.06] bg-[#0d0d14]/90 backdrop-blur-xl md:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f]/90 px-4 backdrop-blur-xl md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-neutral-950">
            A
          </span>
          <span className="text-sm font-semibold text-white">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menyu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-neutral-300"
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
          <div className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-[#0d0d14]">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="md:pl-72">{children}</main>
    </div>
  );
}
