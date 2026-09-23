"use client";

import { api } from "@/lib/api";

/**
 * Admin panel uchun API klienti.
 * Barcha so'rovlar `/api/v1/admin/*` ostida, MODERATOR+ huquqi bilan.
 */

/* ------------------------------- Statistika ------------------------------- */

export interface AdminStats {
  users: { total: number; pilots: number; moderators: number; admins: number; newThisWeek: number };
  courses: { total: number; published: number; lessons: number };
  quizzes: { total: number; questions: number; attempts: number; passed: number };
  news: { total: number; published: number };
  products: { total: number; active: number; outOfStock: number };
  orders: { total: number; new: number; delivered: number; cancelled: number; revenue: number };
  zones: { total: number; active: number };
  certificates: { total: number };
}

export async function getAdminStats(): Promise<AdminStats> {
  return api<AdminStats>("/api/v1/admin/stats", {}, true);
}

/* ------------------------------ Foydalanuvchilar ------------------------------ */

export type AdminRole = "PILOT" | "MODERATOR" | "ADMIN" | "SUPERADMIN";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  exp: number;
  emailVerified: boolean;
  createdAt: string;
  counts?: {
    lessons: number;
    certificates: number;
    attempts: number;
    orders: number;
    violations: number;
  };
}

export async function getAdminUsers(params?: {
  search?: string;
  role?: AdminRole;
}): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.role) query.set("role", params.role);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await api<{ users: AdminUser[] }>(`/api/v1/admin/users${suffix}`, {}, true);
  return data.users;
}

export async function updateAdminUser(
  id: string,
  input: { role?: AdminRole; exp?: number; emailVerified?: boolean }
): Promise<AdminUser> {
  const data = await api<{ user: AdminUser }>(
    `/api/v1/admin/users/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    true
  );
  return data.user;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api(`/api/v1/admin/users/${id}`, { method: "DELETE" }, true);
}

/* -------------------------------- Yangiliklar -------------------------------- */

export interface AdminNews {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  category: string | null;
  coverUrl: string | null;
  published: boolean;
  publishedAt: string;
}

export type AdminNewsInput = {
  slug: string;
  title: string;
  summary?: string;
  body: string;
  category?: string;
  coverUrl?: string;
  published?: boolean;
};

export async function getAdminNews(): Promise<AdminNews[]> {
  const data = await api<{ news: AdminNews[] }>("/api/v1/admin/news", {}, true);
  return data.news;
}

export async function createAdminNews(input: AdminNewsInput): Promise<AdminNews> {
  const data = await api<{ news: AdminNews }>(
    "/api/v1/admin/news",
    { method: "POST", body: JSON.stringify(input) },
    true
  );
  return data.news;
}

export async function updateAdminNews(
  id: string,
  input: Partial<AdminNewsInput>
): Promise<AdminNews> {
  const data = await api<{ news: AdminNews }>(
    `/api/v1/admin/news/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    true
  );
  return data.news;
}

export async function deleteAdminNews(id: string): Promise<void> {
  await api(`/api/v1/admin/news/${id}`, { method: "DELETE" }, true);
}

/* -------------------------------- Mahsulotlar -------------------------------- */

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  active: boolean;
}

export type AdminProductInput = {
  slug: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  active?: boolean;
};

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const data = await api<{ products: AdminProduct[] }>("/api/v1/admin/products", {}, true);
  return data.products;
}

export async function createAdminProduct(input: AdminProductInput): Promise<AdminProduct> {
  const data = await api<{ product: AdminProduct }>(
    "/api/v1/admin/products",
    { method: "POST", body: JSON.stringify(input) },
    true
  );
  return data.product;
}

export async function updateAdminProduct(
  id: string,
  input: Partial<AdminProductInput>
): Promise<AdminProduct> {
  const data = await api<{ product: AdminProduct }>(
    `/api/v1/admin/products/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    true
  );
  return data.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api(`/api/v1/admin/products/${id}`, { method: "DELETE" }, true);
}

/* -------------------------------- Buyurtmalar -------------------------------- */

export interface AdminOrder {
  id: string;
  quantity: number;
  total: number;
  fullName: string;
  phone: string;
  address: string | null;
  status: "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  product: { slug: string; name: string; price: number };
  user: { email: string; fullName: string };
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const data = await api<{ orders: AdminOrder[] }>("/api/v1/admin/orders", {}, true);
  return data.orders;
}

export async function updateAdminOrderStatus(
  id: string,
  status: AdminOrder["status"]
): Promise<AdminOrder> {
  const data = await api<{ order: AdminOrder }>(
    `/api/v1/admin/orders/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true
  );
  return data.order;
}

/* ---------------------------------- Testlar ---------------------------------- */

export interface AdminQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
  position: number;
}

export interface AdminQuiz {
  id: string;
  lessonId: string;
  title: string;
  passScore: number;
  lesson: { title: string; position: number; course: { slug: string; title: string } } | null;
  questions: AdminQuestion[];
  attempts: number;
  passed: number;
}

export type AdminQuizInput = {
  title: string;
  passScore: number;
  questions: Array<{ text: string; options: string[]; correct: number }>;
};

/** Darsga test qo'shish yoki yangilash (lessonId bo'yicha upsert). */
export async function saveAdminQuiz(
  lessonId: string,
  input: AdminQuizInput
): Promise<AdminQuiz> {
  const data = await api<{ quiz: AdminQuiz }>(
    `/api/v1/admin/quizzes/${lessonId}`,
    { method: "PUT", body: JSON.stringify(input) },
    true
  );
  return data.quiz;
}

export async function getAdminQuizzes(): Promise<AdminQuiz[]> {
  const data = await api<{ quizzes: AdminQuiz[] }>("/api/v1/admin/quizzes", {}, true);
  return data.quizzes;
}

export async function deleteAdminQuiz(id: string): Promise<void> {
  await api(`/api/v1/admin/quizzes/${id}`, { method: "DELETE" }, true);
}

/* -------------------------------- Sertifikatlar -------------------------------- */

export interface AdminCertificate {
  id: string;
  code: string;
  issuedAt: string;
  user: { fullName: string; email: string };
  course: { title: string; slug: string };
}

export async function getAdminCertificates(): Promise<AdminCertificate[]> {
  const data = await api<{ certificates: AdminCertificate[] }>(
    "/api/v1/admin/certificates",
    {},
    true
  );
  return data.certificates;
}

export async function deleteAdminCertificate(id: string): Promise<void> {
  await api(`/api/v1/admin/certificates/${id}`, { method: "DELETE" }, true);
}
