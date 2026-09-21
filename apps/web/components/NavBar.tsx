"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getTokens, logout } from "@/lib/api";

const LINKS = [
  { href: "/", label: "Asosiy" },
  { href: "/academy", label: "Akademiya" },
  { href: "/zones", label: "Zonalar" },
  { href: "/dashboard", label: "Kabinet" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthed(Boolean(getTokens()));
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    setAuthed(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-bold text-neutral-950">
            U
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            UZDF <span className="text-sky-400">Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {mounted && authed ? (
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
              <Link href="/register" className={buttonClasses({ size: "sm" })}>
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menyuni ochish"
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-neutral-300 transition hover:bg-white/5 md:hidden"
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

      {open ? (
        <div className="border-t border-white/5 bg-neutral-950/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
            {mounted && authed ? (
              <button
                onClick={handleLogout}
                className={buttonClasses({ variant: "secondary", size: "sm", className: "flex-1" })}
              >
                Chiqish
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonClasses({ variant: "secondary", size: "sm", className: "flex-1" })}
                >
                  Kirish
                </Link>
                <Link href="/register" className={buttonClasses({ size: "sm", className: "flex-1" })}>
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
