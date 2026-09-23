"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  type AdminProduct,
  type AdminProductInput,
} from "@/lib/admin-api";
import { cn } from "@/lib/cn";

const SHELL = "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10";

const som = new Intl.NumberFormat("uz-UZ");

const FK_HINT = "Bu mahsulotga buyurtmalar bog'langan — o'chirish o'rniga faolsizlantiring";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Xatolik";
}

/** Sarlavhadan slug yasash: kichik harflar, bo'shliqlar `-` ga. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isForeignKeyIssue(message: string): boolean {
  return /buyurtmalar bog'langan|foreign key|constraint|P2003/i.test(message);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [active, setActive] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAdminProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getAdminProducts();
        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setCategory("");
    setPrice("");
    setImageUrl("");
    setStock("");
    setActive(true);
  }, []);

  function openCreate() {
    resetForm();
    setError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditingId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setSlugTouched(true);
    setDescription(product.description ?? "");
    setCategory(product.category ?? "");
    setPrice(String(product.price));
    setImageUrl(product.imageUrl ?? "");
    setStock(String(product.stock));
    setActive(product.active);
    setError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  function closeForm() {
    resetForm();
    setFormOpen(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!editingId && !slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug || saving) return;

    const priceValue = price.trim() === "" ? 0 : Number(price);
    const stockValue = stock.trim() === "" ? 0 : Number(stock);

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError("Narx noto'g'ri kiritilgan.");
      return;
    }
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setError("Ombor qoldig'i noto'g'ri kiritilgan.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const input: AdminProductInput = {
      slug: trimmedSlug,
      name: trimmedName,
      description: description.trim() ? description.trim() : undefined,
      category: category.trim() ? category.trim() : undefined,
      price: priceValue,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
      stock: stockValue,
      active,
    };

    try {
      if (editingId) {
        await updateAdminProduct(editingId, input);
        setSuccess("Mahsulot yangilandi.");
      } else {
        await createAdminProduct(input);
        setSuccess("Yangi mahsulot qo'shildi.");
      }
      resetForm();
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function changeStock(product: AdminProduct, delta: number) {
    const nextStock = Math.max(0, product.stock + delta);
    if (nextStock === product.stock) return;

    setBusyId(product.id);
    setError(null);
    setSuccess(null);
    try {
      await updateAdminProduct(product.id, { stock: nextStock });
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(product: AdminProduct) {
    setBusyId(product.id);
    setError(null);
    setSuccess(null);
    try {
      await updateAdminProduct(product.id, { active: !product.active });
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`"${product.name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setBusyId(product.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteAdminProduct(product.id);
      if (editingId === product.id) closeForm();
      await refresh();
      setSuccess("Mahsulot o'chirildi.");
    } catch (err) {
      const message = errorMessage(err);
      setError(isForeignKeyIssue(message) ? FK_HINT : message);
    } finally {
      setBusyId(null);
    }
  }

  const total = products.length;
  const activeCount = products.filter((product) => product.active).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Mahsulotlar"
        subtitle="Do'kon tovarlarini boshqarish"
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            Yangi mahsulot
          </Button>
        }
      />

      {error ? (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert tone="success" className="mt-4">
          {success}
        </Alert>
      ) : null}

      <section className="fade-up mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Jami" value={total} hint="Barcha mahsulotlar" />
        <StatCard
          label="Faol"
          value={activeCount}
          accent="emerald"
          hint="Sotuvda ko'rinadigan"
        />
        <StatCard
          label="Ombori tugagan"
          value={outOfStock}
          accent="red"
          hint="Qoldiq nolga teng"
        />
      </section>

      {formOpen ? (
        <Card className="fade-up mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </h2>
            {editingId ? <Badge tone="sky">Tahrirlanmoqda</Badge> : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nomi">
                <Input
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Masalan: O'quv droni Mini"
                />
              </Field>

              <Field label="Slug" hint="Sarlavhadan avtomatik shakllanadi">
                <Input
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="mini-drone"
                />
              </Field>
            </div>

            <Field label="Tavsif">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Mahsulot haqida qisqacha ma'lumot"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategoriya">
                <Input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Dronlar"
                />
              </Field>

              <Field label="Narx (so'm)">
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rasm URL">
                <Input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Ombor qoldig'i">
                <Input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm transition hover:border-sky-400/40">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-sky-500"
              />
              <span className="font-medium text-neutral-300">Faol</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={saving || !name.trim() || !slug.trim()}
              >
                {saving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Saqlash"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Bekor qilish
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="fade-up mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
          <h2 className="font-medium text-white">Mahsulotlar ro&apos;yxati</h2>
          <Badge tone="neutral">{total} ta</Badge>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Mahsulotlar topilmadi"
              description="Hozircha hech qanday mahsulot yo'q. Birinchi mahsulotni qo'shing."
            >
              <Button type="button" size="sm" onClick={openCreate}>
                Yangi mahsulot
              </Button>
            </EmptyState>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((product) => {
              const busy = busyId === product.id;
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex flex-wrap items-center gap-4 px-5 py-4 transition",
                    editingId === product.id ? "bg-sky-500/5" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-sm font-semibold text-neutral-600">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-neutral-100">
                        {product.name}
                      </p>
                      <Badge tone={product.active ? "emerald" : "neutral"}>
                        {product.active ? "Faol" : "Nofaol"}
                      </Badge>
                      {product.stock === 0 ? <Badge tone="red">Tugagan</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      /{product.slug}
                    </p>
                  </div>

                  <div className="flex w-28 shrink-0 items-center">
                    {product.category ? (
                      <Badge tone="sky">{product.category}</Badge>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </div>

                  <div className="w-32 shrink-0 text-right">
                    <p className="text-sm font-semibold text-emerald-400">
                      {som.format(product.price)} so&apos;m
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-label="Omborni kamaytirish"
                      onClick={() => changeStock(product, -1)}
                      disabled={busy || product.stock === 0}
                    >
                      −
                    </Button>
                    <span className="w-10 text-center text-sm font-medium text-neutral-200">
                      {product.stock}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-label="Omborni ko'paytirish"
                      onClick={() => changeStock(product, 1)}
                      disabled={busy}
                    >
                      +
                    </Button>
                  </div>

                  <label
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-neutral-950/60 px-3 py-2 text-xs transition",
                      busy ? "opacity-50" : "hover:border-sky-400/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={product.active}
                      onChange={() => toggleActive(product)}
                      disabled={busy}
                      className="h-4 w-4 accent-sky-500"
                    />
                    <span className="font-medium text-neutral-300">Faol</span>
                  </label>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(product)}
                      disabled={busy}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      disabled={busy}
                    >
                      O&apos;chirish
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
