"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import {
  createAdminNews,
  deleteAdminNews,
  getAdminNews,
  updateAdminNews,
  type AdminNews,
  type AdminNewsInput,
} from "@/lib/admin-api";

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const CYRILLIC: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "i",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  ў: "o",
  қ: "q",
  ғ: "g",
  ҳ: "h",
};

/** Sarlavhadan lotin harflaridagi slug yasaydi. */
function slugify(value: string): string {
  const latin = value
    .toLowerCase()
    .replace(/[’‘ʻʼ'`]/g, "")
    .replace(/[а-яёўқғҳ]/g, (char) => CYRILLIC[char] ?? "");

  return latin
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Foydalanuvchi kiritayotganda slug'ni ruxsat etilgan belgilargacha tozalaydi. */
function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface NewsDraft {
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  coverUrl: string;
  published: boolean;
}

const EMPTY_DRAFT: NewsDraft = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  category: "",
  coverUrl: "",
  published: false,
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<AdminNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [draft, setDraft] = useState<NewsDraft>(EMPTY_DRAFT);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getAdminNews();
        if (active) setItems(data);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    const data = await getAdminNews();
    setItems(data);
  }

  function updateDraft<K extends keyof NewsDraft>(key: K, value: NewsDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setDraft((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    updateDraft("slug", sanitizeSlug(value));
  }

  function openCreate() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setSlugTouched(false);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  }

  function startEdit(item: AdminNews) {
    setEditingId(item.id);
    setDraft({
      slug: item.slug,
      title: item.title,
      summary: item.summary ?? "",
      body: item.body,
      category: item.category ?? "",
      coverUrl: item.coverUrl ?? "",
      published: item.published,
    });
    setSlugTouched(true);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setSlugTouched(false);
  }

  async function handleRefresh() {
    setError(null);
    setSuccess(null);
    try {
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const canSave =
      draft.title.trim().length > 0 &&
      draft.slug.trim().length > 0 &&
      draft.body.trim().length > 0 &&
      !saving;
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const input: AdminNewsInput = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      summary: draft.summary.trim() || undefined,
      body: draft.body.trim(),
      category: draft.category.trim() || undefined,
      coverUrl: draft.coverUrl.trim() || undefined,
      published: draft.published,
    };

    try {
      if (editingId) {
        await updateAdminNews(editingId, input);
        setSuccess("Yangilik yangilandi.");
      } else {
        await createAdminNews(input);
        setSuccess("Yangi yangilik qo'shildi.");
      }
      closeForm();
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublished(item: AdminNews) {
    setBusyId(item.id);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateAdminNews(item.id, { published: !item.published });
      setItems((prev) => prev.map((news) => (news.id === updated.id ? updated : news)));
      setSuccess(
        updated.published
          ? "Yangilik nashr qilindi."
          : "Yangilik qoralamaga o'tkazildi."
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: AdminNews) {
    if (!window.confirm(`"${item.title}" yangiligini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setBusyId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteAdminNews(item.id);
      if (editingId === item.id) closeForm();
      await refresh();
      setSuccess("Yangilik o'chirildi.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const canSave =
    draft.title.trim().length > 0 &&
    draft.slug.trim().length > 0 &&
    draft.body.trim().length > 0 &&
    !saving;

  return (
    <main className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Yangiliklar"
        subtitle="Yangiliklarni yaratish, tahrirlash va nashr qilish"
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              Yangilash
            </Button>
            <Button type="button" onClick={openCreate}>
              Yangi yangilik
            </Button>
          </>
        }
      />

      {error ? (
        <Alert tone="error" className="fade-up mt-5">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert tone="success" className="fade-up mt-5">
          {success}
        </Alert>
      ) : null}

      <div className={cn("mt-6 grid gap-6", formOpen && "lg:grid-cols-[1.6fr_1fr]")}>
        {formOpen ? (
          <Card className="fade-up order-1 h-fit p-5 lg:order-2 lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Yangilikni tahrirlash" : "Yangi yangilik"}
              </h2>
              {editingId ? <Badge tone="sky">Tahrirlanmoqda</Badge> : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <Field label="Sarlavha">
                <Input
                  value={draft.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Masalan: Yangi poligon ishga tushdi"
                />
              </Field>

              <Field
                label="Slug"
                hint="Sarlavhadan avtomatik yaratiladi, qo'lda ham tahrirlash mumkin."
              >
                <Input
                  value={draft.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="yangi-poligon-ishga-tushdi"
                />
              </Field>

              <Field label="Qisqa matn">
                <Input
                  value={draft.summary}
                  onChange={(event) => updateDraft("summary", event.target.value)}
                  placeholder="Yangilik haqida qisqacha"
                />
              </Field>

              <Field label="Asosiy matn">
                <Textarea
                  value={draft.body}
                  onChange={(event) => updateDraft("body", event.target.value)}
                  rows={12}
                  className="min-h-56"
                  placeholder="Yangilikning to'liq matni..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kategoriya">
                  <Input
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    placeholder="Masalan: Ta'lim"
                  />
                </Field>
                <Field label="Muqova rasmi (URL)">
                  <Input
                    value={draft.coverUrl}
                    onChange={(event) => updateDraft("coverUrl", event.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm transition hover:border-sky-400/40">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => updateDraft("published", event.target.checked)}
                  className="h-4 w-4 accent-sky-500"
                />
                <span className="font-medium text-neutral-300">Nashr qilingan</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Button type="submit" disabled={!canSave}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Bekor qilish
                </Button>
              </div>
            </form>
          </Card>
        ) : null}

        <div className="order-2 flex flex-col gap-4 lg:order-1">
          {loading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : items.length === 0 ? (
            error ? null : (
              <EmptyState
                title="Hozircha yangilik yo'q"
                description="Birinchi yangilikni qo'shish uchun «Yangi yangilik» tugmasini bosing."
              >
                <Button type="button" size="sm" onClick={openCreate}>
                  Yangi yangilik
                </Button>
              </EmptyState>
            )
          ) : (
            items.map((item, index) => (
              <Card
                key={item.id}
                className={cn(
                  "overflow-hidden rise",
                  `rise-${(index % 4) + 1}`,
                  editingId === item.id && "border-sky-400/40"
                )}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-40 w-full shrink-0 bg-white/[0.03] sm:h-auto sm:w-56">
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 224px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid-bg h-full w-full" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.category ? <Badge tone="sky">{item.category}</Badge> : null}
                      <Badge tone={item.published ? "emerald" : "amber"}>
                        {item.published ? "Nashr qilingan" : "Qoralama"}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white">
                      {item.title}
                    </h3>

                    {item.summary ? (
                      <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
                        {item.summary}
                      </p>
                    ) : null}

                    <p className="mt-auto truncate text-xs text-neutral-600">
                      /{item.slug}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(item)}
                      >
                        Tahrirlash
                      </Button>
                      <Button
                        type="button"
                        variant={item.published ? "secondary" : "success"}
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => handleTogglePublished(item)}
                      >
                        {item.published ? "Qoralamaga o'tkazish" : "Nashr qilish"}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => handleDelete(item)}
                      >
                        O&apos;chirish
                      </Button>
                      <Link
                        href={`/news/${item.slug}`}
                        className={buttonClasses({ variant: "ghost", size: "sm" })}
                      >
                        Ko&apos;rish
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
