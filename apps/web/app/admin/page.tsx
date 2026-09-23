"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import {
  getAdminOrders,
  getAdminStats,
  type AdminOrder,
  type AdminStats,
} from "@/lib/admin-api";

const som = new Intl.NumberFormat("uz-UZ");

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const STATUS_LABEL: Record<AdminOrder["status"], string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  DELIVERED: "Yetkazilgan",
  CANCELLED: "Bekor qilingan",
};

const STATUS_TONE: Record<AdminOrder["status"], "amber" | "sky" | "emerald" | "red"> = {
  NEW: "amber",
  CONFIRMED: "sky",
  DELIVERED: "emerald",
  CANCELLED: "red",
};

const QUICK_LINKS = [
  { href: "/admin/users", label: "Foydalanuvchilar" },
  { href: "/admin/courses", label: "Kurslar" },
  { href: "/admin/news", label: "Yangiliklar" },
  { href: "/admin/products", label: "Mahsulotlar" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([getAdminStats(), getAdminOrders()])
      .then(([statsData, ordersData]) => {
        if (!active) return;
        setStats(statsData);
        setOrders(ordersData.slice(0, 5));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "Ma'lumotlarni yuklab bo'lmadi"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const warnings: string[] = [];
  if (stats) {
    if (stats.products.outOfStock > 0) {
      warnings.push(`${stats.products.outOfStock} ta mahsulot ombordan tugagan.`);
    }
    if (stats.orders.new > 0) {
      warnings.push(
        `${stats.orders.new} ta yangi buyurtma tasdiqlashni kutmoqda.`
      );
    }
  }

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Umumiy holat"
        subtitle="Platforma bo'yicha joriy ko'rsatkichlar"
      />

      <div className="mt-6 flex flex-col gap-6">
        {loading ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </>
        ) : error || !stats ? (
          <Alert tone="error">
            {error ?? "Ma'lumotlarni yuklab bo'lmadi. Sahifani qayta yuklang."}
          </Alert>
        ) : (
          <>
            {warnings.length > 0 ? (
              <div className="fade-up flex flex-col gap-3">
                {warnings.map((warning) => (
                  <Alert key={warning} tone="warning">
                    {warning}
                  </Alert>
                ))}
              </div>
            ) : null}

            <section className="fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <StatCard
                label="Foydalanuvchilar"
                value={stats.users.total}
                hint={`Shu haftada +${stats.users.newThisWeek}`}
                accent="sky"
              />
              <StatCard
                label="Kurslar"
                value={`${stats.courses.published}/${stats.courses.total}`}
                hint="Nashr etilgan / jami"
                accent="emerald"
              />
              <StatCard
                label="Darslar"
                value={stats.courses.lessons}
                hint="Barcha kurslar bo'yicha"
                accent="amber"
              />
              <StatCard
                label="Testlar"
                value={stats.quizzes.total}
                hint="Jami testlar"
                accent="violet"
              />
              <StatCard
                label="Savollar"
                value={stats.quizzes.questions}
                hint="Testlardagi savollar"
                accent="red"
              />
              <StatCard
                label="Test urinishlari"
                value={stats.quizzes.attempts}
                hint={`${stats.quizzes.passed} ta muvaffaqiyatli`}
                accent="sky"
              />
              <StatCard
                label="Yangiliklar"
                value={stats.news.published}
                hint={`Jami ${stats.news.total} ta`}
                accent="emerald"
              />
              <StatCard
                label="Mahsulotlar"
                value={stats.products.active}
                hint={`Jami ${stats.products.total} ta`}
                accent="amber"
              />
              <StatCard
                label="Buyurtmalar"
                value={stats.orders.total}
                hint={`${stats.orders.new} ta yangi`}
                accent="violet"
              />
              <StatCard
                label="Tushum"
                value={`${som.format(stats.orders.revenue)} so'm`}
                hint={`${stats.orders.delivered} ta yetkazilgan`}
                accent="red"
              />
              <StatCard
                label="Geozonalar"
                value={stats.zones.active}
                hint={`Jami ${stats.zones.total} ta`}
                accent="sky"
              />
              <StatCard
                label="Sertifikatlar"
                value={stats.certificates.total}
                hint="Berilgan sertifikatlar"
                accent="emerald"
              />
            </section>

            <div className="fade-up grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
                  <h2 className="font-medium text-white">So&apos;nggi buyurtmalar</h2>
                  <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                  >
                    Barchasi
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-neutral-500">
                    Hozircha buyurtmalar yo&apos;q.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <li
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-white/[0.02]"
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-white">
                            {order.product.name}
                          </span>
                          <span className="mt-0.5 truncate text-xs text-neutral-500">
                            {order.user.fullName} · {order.quantity} dona ·{" "}
                            {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-neutral-200">
                            {som.format(order.total)} so&apos;m
                          </span>
                          <Badge tone={STATUS_TONE[order.status]}>
                            {STATUS_LABEL[order.status]}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="flex h-fit flex-col gap-4 p-5">
                <h2 className="font-medium text-white">Tezkor havolalar</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={buttonClasses({
                        variant: "secondary",
                        size: "md",
                        className: "justify-between",
                      })}
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true" className="text-neutral-500">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
