"use client";

import { useSyncExternalStore } from "react";
import { getTokens, subscribeAuth } from "@/lib/api";

/**
 * Foydalanuvchi tizimga kirgan-kirmaganini hydration xatosiz aniqlaydi.
 *
 * `useSyncExternalStore` ishlatilgani uchun:
 *  - SSR/hydration paytida `false` (mehmon) qiymati ishlatiladi;
 *  - gidratdan so'ng haqiqiy qiymat o'qiladi va kerak bo'lsa qayta render bo'ladi;
 *  - effekt ichida setState qilinmaydi (lint toza).
 */
export function useIsAuthed(): boolean {
  return useSyncExternalStore(
    subscribeAuth,
    () => getTokens() !== null,
    () => false
  );
}
