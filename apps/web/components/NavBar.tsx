"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";
import { logout } from "@/lib/api";
import { useIsAuthed } from "@/lib/auth-store";

const LINKS = [
  { href: "/", label: "Asosiy" },
  { href: "/academy", label: "Akademiya" },
  { href: "/zones", label: "Zonalar" },
  { href: "/shop", label: "Do'kon" },
  { href: "/news", label: "Yangiliklar" },
  { href: "/dashboard", label: "Kabinet" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const authed = useIsAuthed();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="glass-strong sticky top-0 z-50">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-cyan-400/20"
      />

      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-sm font-extrabold text-[#04121f] shadow-[0_12px_32px_-14px_rgba(52,211,153,0.95)] transition group-hover:brightness-110">
            D
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-white">
            DRON<span className="gradient-text">CHI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "glass text-emerald-300"
                    : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {active ? (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 pulse-glow" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                ) : null}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {authed ? (
            <button
              onClick={handleLogout}
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Chiqish
            </button>
          ) : (
            <>
              <Link href="/login" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                Kirish
              </Link>
              <Link
                href="/register"
                className={buttonClasses({ size: "sm", className: "ring-glow" })}
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menyuni ochish"
          aria-expanded={open}
          className="glass grid h-10 w-10 place-items-center rounded-full text-neutral-200 transition hover:text-white md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2 5h14M2 9h14M2 13h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        className={cn(
          "relative grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div className="glass-strong mx-3 mb-3 rounded-2xl p-3">
            <nav className="flex flex-col gap-1">
              {LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "glass text-emerald-300"
                        : "text-neutral-300 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-glow" />
                    ) : null}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <ThemeToggle className="shrink-0" />
              {authed ? (
                <button
                  onClick={handleLogout}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                    className: "flex-1",
                  })}
                >
                  Chiqish
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={buttonClasses({
                      variant: "secondary",
                      size: "sm",
                      className: "flex-1",
                    })}
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    className={buttonClasses({ size: "sm", className: "flex-1" })}
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
