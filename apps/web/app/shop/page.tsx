"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { createOrder, getMyOrders, getProducts, type OrderItem, type Product } from "@/lib/api";
import { useIsAuthed } from "@/lib/auth-store";

const som = new Intl.NumberFormat("uz-UZ");

const STATUS_LABEL: Record<OrderItem["status"], string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  DELIVERED: "Yetkazilgan",
  CANCELLED: "Bekor qilingan",
};

const STATUS_TONE: Record<OrderItem["status"], "amber" | "sky" | "emerald" | "red"> = {
  NEW: "amber",
  CONFIRMED: "sky",
  DELIVERED: "emerald",
  CANCELLED: "red",
};

/* ---------------------------------- Ikonkalar ---------------------------------- */

const icons = {
  box: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16h8.3a2 2 0 0 0 1.95-1.55L21 8H6" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  spark: <path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12l1-7Z" />,
} as const;

function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function stockTone(stock: number): "emerald" | "amber" | "red" {
  if (stock <= 0) return "red";
  if (stock <= 5) return "amber";
  return "emerald";
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const authed = useIsAuthed();

  async function loadOrders() {
    if (!authed) return;
    try {
      setOrders(await getMyOrders());
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const [productsResult, ordersResult] = await Promise.allSettled([
        getProducts(),
        authed ? getMyOrders() : Promise.resolve<OrderItem[]>([]),
      ]);

      if (!active) return;

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        setError(
          productsResult.reason instanceof Error
            ? productsResult.reason.message
            : "Ma'lumotlarni yuklab bo'lmadi"
        );
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value);
      }

      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [authed]);

  async function handleOrder(formData: FormData) {
    if (!activeProduct) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
      if (quantity > activeProduct.stock) {
        setError(`Omborda faqat ${activeProduct.stock} dona mavjud`);
        return;
      }

      const order = await createOrder({
        productId: activeProduct.id,
        quantity,
        fullName: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? "") || undefined,
      });
      setSuccess(
        `Buyurtma qabul qilindi: ${order.product.name} · ${som.format(order.total)} so'm`
      );
      setActiveProduct(null);
      await loadOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const categoryCount = new Set(
    products
      .map((product) => product.category)
      .filter((category): category is string => Boolean(category))
  ).size;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      {/* -------------------------------- HERO -------------------------------- */}
      <section className="glass mesh-card gradient-border rise relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <Badge tone="emerald">
              <Icon name="cart" className="h-3.5 w-3.5" />
              Do&apos;kon
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              <span className="gradient-text">Do&apos;kon</span>
              <span className="mt-1 block text-2xl font-bold text-white/90 sm:text-3xl">
                O&apos;quv dronlari va aksessuarlar
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              Qonunchilikka mos, 250 grammdan oshmagan o&apos;quv dronlari va
              aksessuarlar. Buyurtmani bir necha bosqichda rasmiylashtiring — holatini
              shu sahifada kuzatib boring.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Mahsulotlar"
              value={loading ? "..." : products.length}
              hint="Do'kondagi mavjud pozitsiyalar"
              accent="emerald"
              icon={<Icon name="box" className="h-5 w-5" />}
            />
            <StatCard
              label="Mavjud ombor"
              value={loading ? "..." : totalStock}
              hint="Buyurtma uchun tayyor dona"
              accent="sky"
              icon={<Icon name="cart" className="h-5 w-5" />}
            />
            <StatCard
              label="Kategoriyalar"
              value={loading ? "..." : categoryCount}
              hint="Turli yo'nalishdagi uskunalar"
              accent="violet"
              icon={<Icon name="tag" className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-6">
        {success ? <Alert tone="success">{success}</Alert> : null}
        {error && !activeProduct ? <Alert tone="error">{error}</Alert> : null}

        {/* ------------------------------ MAHSULOTLAR ------------------------------ */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="glass flex flex-col gap-3 rounded-3xl p-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 && !error ? (
          <EmptyState
            title="Mahsulotlar yo'q"
            description="Do'kon tovarlari qo'shilgach shu yerda paydo bo'ladi."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <Card
                key={product.id}
                hover
                mesh
                className={`group rise rise-${(index % 6) + 1} flex h-full flex-col overflow-hidden`}
              >
                <div className="relative h-44 w-full overflow-hidden bg-white/[0.03]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-neutral-600">
                      <Icon name="box" className="h-10 w-10" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/25 to-transparent" />
                  {product.category ? (
                    <span className="absolute left-3 top-3">
                      <Badge tone="sky">{product.category}</Badge>
                    </span>
                  ) : null}
                  <span className="absolute right-3 top-3">
                    <Badge tone={stockTone(product.stock)}>
                      {product.stock > 0 ? `${product.stock} dona` : "Tugagan"}
                    </Badge>
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="font-display text-lg font-bold tracking-tight text-white">
                    {product.name}
                  </h2>
                  {product.description ? (
                    <p className="flex-1 text-sm leading-relaxed text-neutral-400">
                      {product.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                        Narx
                      </span>
                      <span className="gradient-text font-display text-xl font-extrabold">
                        {som.format(product.price)} so&apos;m
                      </span>
                    </div>
                    {authed ? (
                      <Button
                        size="sm"
                        disabled={product.stock <= 0}
                        onClick={() => {
                          setActiveProduct(product);
                          setSuccess(null);
                          setError(null);
                        }}
                      >
                        <Icon name="cart" className="h-3.5 w-3.5" />
                        Buyurtma berish
                      </Button>
                    ) : (
                      <Link
                        href="/login"
                        className={buttonClasses({ variant: "secondary", size: "sm" })}
                      >
                        Kirib buyurtma berish
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ------------------------------- BUYURTMA ------------------------------- */}
        {activeProduct ? (
          <Card
            border
            glow
            mesh
            className="rise flex flex-col gap-6 p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Badge tone="emerald">
                  <Icon name="spark" className="h-3.5 w-3.5" />
                  Buyurtma berish
                </Badge>
                <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {activeProduct.name}
                </h2>
                <p className="text-sm text-neutral-400">
                  Ma&apos;lumotlarni to&apos;ldiring — buyurtmangiz darhol qabul qilinadi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/20 hover:text-white"
              >
                Bekor qilish
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="glass rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Narx
                </p>
                <p className="gradient-text mt-1 font-display text-lg font-extrabold">
                  {som.format(activeProduct.price)} so&apos;m
                </p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Ombordagi zaxira
                </p>
                <p className="mt-1 font-display text-lg font-extrabold text-white">
                  {activeProduct.stock} dona
                </p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Kategoriya
                </p>
                <p className="mt-1 font-display text-lg font-extrabold text-white">
                  {activeProduct.category ?? "Umumiy"}
                </p>
              </div>
            </div>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <form action={handleOrder} className="grid gap-4 sm:grid-cols-2">
              <Field label="To'liq ism">
                <Input name="fullName" required placeholder="Ism Familiya" />
              </Field>
              <Field label="Telefon">
                <Input name="phone" required placeholder="+998 90 123 45 67" />
              </Field>
              <Field
                label="Manzil"
                hint="Ixtiyoriy — yetkazib berish uchun"
                className="sm:col-span-2"
              >
                <Input name="address" placeholder="Shahar, tuman, manzil" />
              </Field>
              <Field
                label="Soni"
                hint={`1 dona uchun ${som.format(activeProduct.price)} so'm`}
              >
                <Input
                  name="quantity"
                  type="number"
                  required
                  min={1}
                  max={activeProduct.stock}
                  defaultValue={1}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full ring-glow sm:w-auto"
                >
                  {submitting ? "Yuborilmoqda..." : "Buyurtmani yuborish"}
                </Button>
              </div>
            </form>
          </Card>
        ) : null}

        {/* --------------------------- MENING BUYURTMALARIM --------------------------- */}
        {authed && orders.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Mening buyurtmalarim
              </h2>
              <Badge tone="neutral">{orders.length} ta</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`glass card-hover rise rise-${(index % 6) + 1} flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300">
                      <Icon name="box" className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-white">
                        {order.product.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString("uz-UZ")} ·{" "}
                        {order.quantity} dona
                        {order.address ? ` · ${order.address}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-bold text-white">
                      {som.format(order.total)} so&apos;m
                    </span>
                    <Badge tone={STATUS_TONE[order.status]}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
