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
    default:
      return null;
  }
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/my-courses", label: "Mening kurslarim", icon: "book" },
  { href: "/academy", label: "Akademiya", icon: "book" },
  { href: "/certificates", label: "Sertifikatlar", icon: "award" },
  { href: "/rating", label: "Reyting", icon: "trophy" },
  { href: "/zones", label: "Zonalar", icon: "map" },
  { href: "/admin", label: "Admin panel", icon: "shield" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-bold text-neutral-950">
          U
        </span>
        <span className="text-base font-semibold tracking-tight text-white">
          UZDF <span className="text-sky-400">Pro</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-gradient-to-r from-sky-500/15 to-transparent text-white ring-1 ring-inset ring-sky-500/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn(active ? "text-sky-400" : "text-neutral-500")}>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        {user ? (
          <>
            <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                {user.role}
              </span>
              <span className="text-xs font-semibold text-sky-400">{user.exp} EXP</span>
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
  );

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 bg-neutral-950/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-neutral-950/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-bold text-neutral-950">
            U
          </span>
          <span className="text-sm font-semibold text-white">
            UZDF <span className="text-sky-400">Pro</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menyu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-neutral-300"
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
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Yopish"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-neutral-950">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
