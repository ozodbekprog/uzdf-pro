"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Select } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { cn } from "@/lib/cn";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/lib/admin-api";

type OrderStatus = AdminOrder["status"];
type FilterValue = OrderStatus | "ALL";

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const som = new Intl.NumberFormat("uz-UZ");

const STATUS_ORDER: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  DELIVERED: "Yetkazilgan",
  CANCELLED: "Bekor qilingan",
};

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  NEW: "amber",
  CONFIRMED: "sky",
  DELIVERED: "emerald",
  CANCELLED: "red",
};

/** Faqat shu o'tishlarga ruxsat beriladi. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlash",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilish",
};

const ACTION_VARIANT: Record<
  OrderStatus,
  "primary" | "secondary" | "success" | "danger"
> = {
  NEW: "secondary",
  CONFIRMED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const FILTER_LABEL: Record<FilterValue, string> = {
  ALL: "Barchasi",
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  DELIVERED: "Yetkazilgan",
  CANCELLED: "Bekor qilingan",
};

interface StatusCounts {
  NEW: number;
  CONFIRMED: number;
  DELIVERED: number;
  CANCELLED: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getAdminOrders();
    setOrders(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Buyurtmalarni yuklab bo'lmadi."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Buyurtmalarni yuklab bo'lmadi."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(order: AdminOrder, next: OrderStatus) {
    setUpdatingId(order.id);
    setActionError(null);
    try {
      const updated = await updateAdminOrderStatus(order.id, next);
      setOrders((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Holatni o'zgartirib bo'lmadi."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts: StatusCounts = {
    NEW: 0,
    CONFIRMED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  let revenue = 0;
  for (const order of orders) {
    counts[order.status] += 1;
    if (order.status !== "CANCELLED") {
      revenue += order.total;
    }
  }

  const filtered =
    filter === "ALL" ? orders : orders.filter((order) => order.status === filter);

  return (
    <main className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Buyurtmalar"
        subtitle="Mahsulot buyurtmalarini kuzatish va holatini boshqarish"
        actions={
          <>
            <Link
              href="/admin/products"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Mahsulotlar
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              Yangilash
            </Button>
          </>
        }
      />

      {error ? (
        <Alert tone="error" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              Qayta urinish
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading ? (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-24" />
            ))}
          </section>
          <Card className="mt-6 p-5">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="mt-5 flex flex-col gap-4">
              {[0, 1, 2, 3].map((key) => (
                <Skeleton key={key} className="h-40" />
              ))}
            </div>
          </Card>
        </>
      ) : !error ? (
        <>
          <section className="fade-up mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Jami"
              value={orders.length}
              accent="sky"
              hint="Barcha buyurtmalar"
            />
            <StatCard
              label="Yangi"
              value={counts.NEW}
              accent="amber"
              hint="Ko'rib chiqilishi kerak"
            />
            <StatCard
              label="Yetkazilgan"
              value={counts.DELIVERED}
              accent="emerald"
              hint="Muvaffaqiyatli yakunlangan"
            />
            <StatCard
              label="Bekor qilingan"
              value={counts.CANCELLED}
              accent="red"
              hint="Rad etilgan buyurtmalar"
            />
            <StatCard
              label="Umumiy tushum"
              value={`${som.format(revenue)} so'm`}
              accent="violet"
              hint="Bekor qilinganlar hisobga olinmagan"
            />
          </section>

          {actionError ? (
            <Alert tone="error" className="mt-6">
              {actionError}
            </Alert>
          ) : null}

          <Card className="fade-up mt-6 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-medium text-white">
                  Buyurtmalar ro&apos;yxati
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {filtered.length} ta buyurtma ko&apos;rsatilmoqda
                </p>
              </div>
              <Field label="Holat filtri" className="w-full sm:w-60">
                <Select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as FilterValue)
                  }
                >
                  <option value="ALL">
                    {FILTER_LABEL.ALL} ({orders.length})
                  </option>
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {FILTER_LABEL[status]} ({counts[status]})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {orders.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Buyurtmalar topilmadi"
                  description="Hozircha hech qanday buyurtma mavjud emas. Yangi buyurtmalar paydo bo'lganda shu yerda ko'rinadi."
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Bu holatda buyurtmalar yo'q"
                  description={`"${FILTER_LABEL[filter]}" holatiga mos buyurtma topilmadi. Filtrni o'zgartirib ko'ring.`}
                />
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map((order) => {
                  const transitions = NEXT_STATUS[order.status];
                  const isUpdating = updatingId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={cn(
                        "p-5 transition",
                        isUpdating ? "bg-sky-500/5" : "hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-white">
                              {order.product.name}
                            </h3>
                            <Badge tone={STATUS_TONE[order.status]}>
                              {STATUS_LABEL[order.status]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">
                            {som.format(order.product.price)} so&apos;m ×{" "}
                            {order.quantity} dona
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-emerald-400">
                            {som.format(order.total)} so&apos;m
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "uz-UZ"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                            Mijoz
                          </p>
                          <p className="mt-1.5 text-sm font-medium text-neutral-200">
                            {order.fullName}
                          </p>
                          <a
                            href={`tel:${order.phone}`}
                            className="mt-0.5 block text-sm text-sky-400 transition hover:text-sky-300"
                          >
                            {order.phone}
                          </a>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {order.address
                              ? order.address
                              : "Manzil ko'rsatilmagan"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                            Foydalanuvchi
                          </p>
                          <p className="mt-1.5 text-sm font-medium text-neutral-200">
                            {order.user.fullName}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-neutral-500">
                            {order.user.email}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:col-span-2 lg:col-span-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                            Holatni o&apos;zgartirish
                          </p>
                          {transitions.length === 0 ? (
                            <p className="mt-1.5 text-xs text-neutral-500">
                              Yakuniy holat — amal mavjud emas.
                            </p>
                          ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {transitions.map((next) => (
                                <Button
                                  key={next}
                                  type="button"
                                  size="sm"
                                  variant={ACTION_VARIANT[next]}
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(order, next)}
                                >
                                  {ACTION_LABEL[next]}
                                </Button>
                              ))}
                              {isUpdating ? (
                                <span className="self-center text-xs text-neutral-500">
                                  Yangilanmoqda...
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </main>
  );
}
