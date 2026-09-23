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
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        className="fade-up"
        title="Do'kon"
        subtitle="Qonunchilikka mos, 250 grammdan oshmagan o'quv dronlari va aksessuarlar."
      />

      <div className="mt-6 flex flex-col gap-6">
        {success ? <Alert tone="success">{success}</Alert> : null}
        {error && !activeProduct ? <Alert tone="error">{error}</Alert> : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
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
                className={`rise rise-${(index % 3) + 1} flex h-full flex-col overflow-hidden`}
              >
                <div className="relative h-40 w-full overflow-hidden bg-white/[0.03]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 hover:scale-105"
                      priority={index === 0}
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/20 to-transparent" />
                  {product.category ? (
                    <span className="absolute left-3 top-3">
                      <Badge tone="sky">{product.category}</Badge>
                    </span>
                  ) : null}
                  <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-[#050a17]/70 px-2.5 py-0.5 text-[11px] text-neutral-300 backdrop-blur">
                    {product.stock > 0 ? `${product.stock} dona` : "Tugagan"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-base font-semibold text-white">{product.name}</h2>
                  {product.description ? (
                    <p className="flex-1 text-sm leading-relaxed text-neutral-400">
                      {product.description}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-lg font-semibold text-emerald-400">
                      {som.format(product.price)} so&apos;m
                    </span>
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

        {activeProduct ? (
          <Card glow className="fade-up flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Buyurtma: {activeProduct.name}
              </h2>
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="text-sm text-neutral-400 transition hover:text-white"
              >
                Bekor qilish
              </button>
            </div>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <form action={handleOrder} className="grid gap-4 sm:grid-cols-2">
              <Field label="To'liq ism">
                <Input name="fullName" required placeholder="Ism Familiya" />
              </Field>
              <Field label="Telefon">
                <Input name="phone" required placeholder="+998 90 123 45 67" />
              </Field>
              <Field label="Manzil" className="sm:col-span-2">
                <Input name="address" placeholder="Shahar, tuman, manzil" />
              </Field>
              <Field label="Soni" hint={`Narxi: ${som.format(activeProduct.price)} so'm`}>
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
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Yuborilmoqda..." : "Buyurtmani yuborish"}
                </Button>
              </div>
            </form>
          </Card>
        ) : null}

        {authed && orders.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Mening buyurtmalarim
            </h2>
            {orders.map((order) => (
              <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">{order.product.name}</span>
                  <span className="text-xs text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("uz-UZ")} · {order.quantity} dona
                    {order.address ? ` · ${order.address}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-300">{som.format(order.total)} so&apos;m</span>
                  <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                </div>
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
