export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ZoneType = "RED" | "YELLOW" | "GREEN";

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  description?: string | null;
  polygon: Array<[number, number]>;
  active: boolean;
}

export interface ZoneInput {
  name: string;
  type: ZoneType;
  description?: string;
  polygon: Array<[number, number]>;
  active?: boolean;
}

export interface ZoneCheckResult {
  status: "RED" | "YELLOW" | "GREEN" | "CLEAR";
  zones: Array<{ id: string; name: string; type: ZoneType; description?: string | null }>;
}

export interface ZoneStats {
  total: number;
  active: number;
  byType: { RED: number; YELLOW: number; GREEN: number };
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
  emailVerified: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  position: number;
  minReadSeconds: number;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCount: number;
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

export interface LessonProgress {
  id: string;
  startedAt: string;
  completedAt: string | null;
  lesson: {
    id: string;
    title: string;
    position: number;
    minReadSeconds: number;
    course: { slug: string; title: string };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

const STORAGE_KEY = "uzdfpro.tokens";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export function getTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export function setTokens(tokens: StoredTokens): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const tokens = getTokens();
    if (tokens) headers.authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ?? "So'rovda xatolik";
    throw new Error(message);
  }

  return data as T;
}

/* ----------------------------- Auth ----------------------------- */

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<{ message: string; devOtp?: string }> {
  return api<{ ok: true; message: string; devOtp?: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmail(email: string, otp: string): Promise<{ message: string }> {
  return api<{ ok: true; message: string }>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function logout(): Promise<void> {
  const tokens = getTokens();
  try {
    if (tokens) {
      await api("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    }
  } finally {
    clearTokens();
  }
}

export async function getMe(): Promise<PublicUser> {
  const data = await api<{ user: PublicUser }>("/api/v1/auth/me", {}, true);
  return data.user;
}

/* ----------------------------- Zones ----------------------------- */

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

export async function getZoneStats(): Promise<ZoneStats> {
  const data = await api<ZoneStats>("/api/v1/zones/stats");
  return data;
}

export async function getManagedZones(): Promise<Zone[]> {
  const data = await api<{ zones: Zone[] }>("/api/v1/zones/manage", {}, true);
  return data.zones;
}

export async function createZone(input: ZoneInput): Promise<Zone> {
  const data = await api<{ zone: Zone }>(
    "/api/v1/zones",
    { method: "POST", body: JSON.stringify(input) },
    true
  );
  return data.zone;
}

export async function updateZone(id: string, input: Partial<ZoneInput>): Promise<Zone> {
  const data = await api<{ zone: Zone }>(
    `/api/v1/zones/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    true
  );
  return data.zone;
}

export async function deleteZone(id: string): Promise<void> {
  await api(`/api/v1/zones/${id}`, { method: "DELETE" }, true);
}

/* ---------------------------- Academy ---------------------------- */

export async function getCourses(): Promise<CourseSummary[]> {
  const data = await api<{ courses: CourseSummary[] }>("/api/v1/courses");
  return data.courses;
}

export async function getCourse(slug: string): Promise<CourseDetail> {
  const data = await api<{ course: CourseDetail }>(`/api/v1/courses/${slug}`);
  return data.course;
}

export async function startLesson(lessonId: string): Promise<void> {
  await api(`/api/v1/courses/lessons/${lessonId}/start`, { method: "POST" }, true);
}

export async function completeLesson(
  lessonId: string
): Promise<{ expAwarded: number; totalExp?: number; alreadyCompleted?: boolean }> {
  return api<{ expAwarded: number; totalExp?: number; alreadyCompleted?: boolean }>(
    `/api/v1/courses/lessons/${lessonId}/complete`,
    { method: "POST" },
    true
  );
}

export async function getProgress(): Promise<LessonProgress[]> {
  const data = await api<{ progress: LessonProgress[] }>(
    "/api/v1/courses/me/progress",
    {},
    true
  );
  return data.progress;
}

/* --------------------------- Dashboard --------------------------- */

export interface MyCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessonsCount: number;
  completedCount: number;
  percent: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  lastActivityAt: string | null;
}

export interface DashboardStats {
  exp: number;
  level: number;
  completedLessons: number;
  certificates: number;
  ratingPosition: number | null;
}

export interface DashboardData {
  stats: DashboardStats;
  courses: MyCourse[];
}

export interface RatingUser {
  position: number;
  id: string;
  fullName: string;
  exp: number;
  level: number;
}

export interface CertificateItem {
  id: string;
  code: string;
  issuedAt: string;
  course: { slug: string; title: string; description: string | null };
}

export interface CertificateVerify {
  code: string;
  issuedAt: string;
  user: { fullName: string };
  course: { slug: string; title: string };
}

export async function getDashboard(): Promise<DashboardData> {
  return api<DashboardData>("/api/v1/dashboard/me", {}, true);
}

export async function getRating(limit = 20): Promise<RatingUser[]> {
  const data = await api<{ users: RatingUser[] }>(`/api/v1/rating?limit=${limit}`);
  return data.users;
}

export async function getMyCertificates(): Promise<CertificateItem[]> {
  const data = await api<{ certificates: CertificateItem[] }>(
    "/api/v1/certificates/me",
    {},
    true
  );
  return data.certificates;
}

export async function verifyCertificate(code: string): Promise<CertificateVerify> {
  const data = await api<{ certificate: CertificateVerify }>(
    `/api/v1/certificates/verify/${code}`
  );
  return data.certificate;
}
