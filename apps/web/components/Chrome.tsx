"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/NavBar";
import { useIsAuthed } from "@/lib/auth-store";

/** Kirish/ro'yxatdan o'tish sahifalari — har doim yengil (NavBar) ko'rinishda. */
const AUTH_ROUTES = ["/login", "/register"];

/** Bu sahifalar AppShell'ni o'zi ichida ishlatadi. */
const SELF_SHELL_ROUTES = ["/dashboard", "/my-courses", "/certificates", "/rating"];

function matches(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Sahifa qobig'ini tanlaydi:
 *  - tizimga kirgan foydalanuvchi  -> AppShell (chap menyuli dashboard qobig'i)
 *  - mehmon                        -> NavBar (yuqori navigatsiya)
 */
export default function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authed = useIsAuthed();

  if (matches(pathname, AUTH_ROUTES)) {
    return (
      <>
        <NavBar />
        {children}
      </>
    );
  }

  if (matches(pathname, SELF_SHELL_ROUTES)) {
    return <>{children}</>;
  }

  if (authed) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
