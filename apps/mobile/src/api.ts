import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * API-клиент мобильного приложения.
 * Работает с тем же Fastify API, что и web (apps/web/lib/api.ts).
 *
 * ВАЖНО: телефон и компьютер должны быть в одной Wi-Fi сети.
 * Адрес API по умолчанию — LAN-IP этой машины, меняется на экране "Bosh sahifa".
 */

export const DEFAULT_API_URL = "https://dronchi-api.vercel.app";

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
    ...((options.headers as Record<string, string>) ?? {}),
  };
  // Body bo'lmasa content-type yuborilmaydi (bo'sh JSON body xatosi oldini oladi).
  if (options.body !== undefined && options.body !== null) {
    headers["content-type"] = headers["content-type"] ?? "application/json";
  }
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

/* ---------------- O'quv jarayoni ---------------- */

export async function startLesson(lessonId: string): Promise<void> {
  await api(`/api/v1/courses/lessons/${lessonId}/start`, { method: "POST" }, true);
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

export async function getProgress(): Promise<LessonProgress[]> {
  const data = await api<{ progress: LessonProgress[] }>(
    "/api/v1/courses/me/progress",
    {},
    true
  );
  return data.progress;
}

/* ---------------- Testlar ---------------- */

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface LessonQuiz {
  id: string;
  title: string;
  passScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttemptSummary {
  score: number;
  total: number;
  passed: boolean;
  createdAt: string;
}

export interface LessonQuizResponse {
  ok: true;
  quiz: LessonQuiz;
  lastAttempt: QuizAttemptSummary | null;
}

export async function getLessonQuiz(lessonId: string): Promise<LessonQuizResponse> {
  return api<LessonQuizResponse>(`/api/v1/quizzes/lesson/${lessonId}`, {}, true);
}

export async function submitQuiz(
  quizId: string,
  answers: number[]
): Promise<{
  attempt: { score: number; total: number; percent: number; passed: boolean };
  expAwarded: number;
  totalExp: number;
}> {
  return api(
    `/api/v1/quizzes/${quizId}/submit`,
    { method: "POST", body: JSON.stringify({ answers }) },
    true
  );
}

/* ---------------- Yangiliklar ---------------- */

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverUrl: string | null;
  publishedAt: string;
}

export interface NewsDetail extends NewsItem {
  body: string;
}

export async function getNews(): Promise<NewsItem[]> {
  const data = await api<{ news: NewsItem[] }>("/api/v1/news");
  return data.news;
}

export async function getNewsItem(slug: string): Promise<NewsDetail> {
  const data = await api<{ news: NewsDetail }>(`/api/v1/news/${slug}`);
  return data.news;
}

/* ---------------- Do'kon ---------------- */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  total: number;
  fullName: string;
  phone: string;
  address: string | null;
  status: "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  product: { slug: string; name: string; price: number };
}

export async function getProducts(): Promise<Product[]> {
  const data = await api<{ products: Product[] }>("/api/v1/shop/products");
  return data.products;
}

export async function createOrder(input: {
  productId: string;
  quantity: number;
  fullName: string;
  phone: string;
  address?: string;
}): Promise<OrderItem> {
  const data = await api<{ order: OrderItem }>(
    "/api/v1/shop/orders",
    { method: "POST", body: JSON.stringify(input) },
    true
  );
  return data.order;
}

export async function getMyOrders(): Promise<OrderItem[]> {
  const data = await api<{ orders: OrderItem[] }>("/api/v1/shop/orders/me", {}, true);
  return data.orders;
}

/* ---------------- Sertifikat va reyting ---------------- */

export interface CertificateItem {
  id: string;
  code: string;
  issuedAt: string;
  course: { slug: string; title: string; description: string | null };
}

export async function getMyCertificates(): Promise<CertificateItem[]> {
  const data = await api<{ certificates: CertificateItem[] }>(
    "/api/v1/certificates/me",
    {},
    true
  );
  return data.certificates;
}

export interface RatingUser {
  position: number;
  id: string;
  fullName: string;
  exp: number;
  level: number;
}

export async function getRating(limit = 20): Promise<RatingUser[]> {
  const data = await api<{ users: RatingUser[] }>(`/api/v1/rating?limit=${limit}`);
  return data.users;
}
