import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * API-клиент мобильного приложения.
 * Работает с тем же Fastify API, что и web (apps/web/lib/api.ts).
 *
 * ВАЖНО: телефон и компьютер должны быть в одной Wi-Fi сети.
 * Адрес API по умолчанию — LAN-IP этой машины, меняется на экране "Bosh sahifa".
 */

export const DEFAULT_API_URL = "http://190.191.13.156:4000";

const API_URL_KEY = "uzdfpro.apiUrl";
const TOKENS_KEY = "uzdfpro.tokens";

export type ZoneType = "RED" | "YELLOW" | "GREEN";

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  description?: string | null;
  polygon: Array<[number, number]>;
  active: boolean;
}

export interface ZoneCheckResult {
  status: "RED" | "YELLOW" | "GREEN" | "CLEAR";
  zones: Array<{ id: string; name: string; type: ZoneType; description?: string | null }>;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
  emailVerified: boolean;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  position: number;
  minReadSeconds: number;
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

export interface DashboardData {
  stats: {
    exp: number;
    level: number;
    completedLessons: number;
    certificates: number;
    ratingPosition: number | null;
  };
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    lessonsCount: number;
    completedCount: number;
    percent: number;
    nextLessonTitle: string | null;
  }>;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

let cachedApiUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;
  const saved = await AsyncStorage.getItem(API_URL_KEY);
  cachedApiUrl = saved ?? DEFAULT_API_URL;
  return cachedApiUrl;
}

export async function setApiUrl(url: string): Promise<void> {
  cachedApiUrl = url.replace(/\/+$/, "");
  await AsyncStorage.setItem(API_URL_KEY, cachedApiUrl);
}

async function getTokens(): Promise<StoredTokens | null> {
  const raw = await AsyncStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

async function setTokens(t: StoredTokens): Promise<void> {
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(t));
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(TOKENS_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  return (await getTokens()) !== null;
}

export async function api<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const base = await getApiUrl();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (auth) {
    const tokens = await getTokens();
    if (tokens) headers.authorization = `Bearer ${tokens.accessToken}`;
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `So'rovda xatolik (${res.status})`);
  }
  return data as T;
}

/* ---------------- Auth ---------------- */

export async function login(email: string, password: string): Promise<PublicUser> {
  const data = await api<{
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
  }>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<{ message: string; devOtp?: string }> {
  return api("/api/v1/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export async function verifyEmail(email: string, otp: string): Promise<void> {
  await api("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function logout(): Promise<void> {
  const tokens = await getTokens();
  try {
    if (tokens) {
      await api("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    }
  } finally {
    await clearTokens();
  }
}

export async function getMe(): Promise<PublicUser> {
  const data = await api<{ user: PublicUser }>("/api/v1/auth/me", {}, true);
  return data.user;
}

/* ---------------- Zones ---------------- */

export async function getZones(): Promise<Zone[]> {
  const data = await api<{ zones: Zone[] }>("/api/v1/zones");
  return data.zones;
}

export async function checkZone(lat: number, lng: number): Promise<ZoneCheckResult> {
  return api<ZoneCheckResult>("/api/v1/zones/check", {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  });
}

/* ---------------- Academy ---------------- */

export async function getCourses(): Promise<CourseSummary[]> {
  const data = await api<{ courses: CourseSummary[] }>("/api/v1/courses");
  return data.courses;
}

export async function getCourse(slug: string): Promise<CourseDetail> {
  const data = await api<{ course: CourseDetail }>(`/api/v1/courses/${slug}`);
  return data.course;
}

export async function completeLesson(
  lessonId: string
): Promise<{ expAwarded: number; alreadyCompleted?: boolean }> {
  return api(`/api/v1/courses/lessons/${lessonId}/complete`, { method: "POST" }, true);
}

/* ---------------- Dashboard ---------------- */

export async function getDashboard(): Promise<DashboardData> {
  return api<DashboardData>("/api/v1/dashboard/me", {}, true);
}
