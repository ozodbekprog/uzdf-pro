"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getNews, type NewsItem } from "@/lib/api";

/* ---------------------------------- Ikonkalar ---------------------------------- */

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* --------------------------------- Yordamchilar -------------------------------- */

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* --------------------------------- Komponentlar -------------------------------- */

function FeaturedNews({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group block rise rise-2">
      <article className="glass gradient-border card-hover relative h-[22rem] w-full overflow-hidden rounded-[2rem]">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover transition duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="grid-bg h-full w-full bg-white/[0.03]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="emerald">{item.category ?? "Yangilik"}</Badge>
            <span className="text-xs text-neutral-300">{formatDate(item.publishedAt)}</span>
          </div>
          <h2 className="font-display max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
            {item.title}
          </h2>
          {item.summary ? (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
              {item.summary}
            </p>
          ) : null}
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
            Batafsil o&apos;qish
            <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className={`group block h-full rise rise-${(index % 4) + 3}`}
    >
      <Card hover className="flex h-full flex-col overflow-hidden">
        <div className="relative h-48 w-full">
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid-bg h-full w-full bg-white/[0.03]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/15 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {item.category ? <Badge tone="emerald">{item.category}</Badge> : null}
            <span className="text-xs text-neutral-500">{formatDate(item.publishedAt)}</span>
          </div>
          <h3 className="font-display text-lg font-bold leading-snug text-white">
            {item.title}
          </h3>
          {item.summary ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-neutral-400">
              {item.summary}
            </p>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
            O&apos;qish
            <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

/* ----------------------------------- Sahifa ----------------------------------- */

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getNews();
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

  const featured = items.length > 0 ? items[0] : null;
  const rest = items.slice(1);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      {/* --------------------------------- HERO --------------------------------- */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="flex flex-col items-start gap-5 rise rise-1">
          <Badge tone="emerald">Soha yangiliklari</Badge>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-white">Yangilik</span>
            <span className="gradient-text">lar</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-400">
            Dron sohasi, poligonlar, simulyator va akademiya bo&apos;yicha so&apos;nggi
            xabarlar.
          </p>
        </div>

        <aside className="glass mesh-card rise rise-2 rounded-3xl p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
            Yangiliklar oqimi
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold gradient-text">
            {loading ? "—" : items.length}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            e&apos;lon qilingan yangiliklar
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-500">
            <span className="pulse-glow h-2 w-2 rounded-full bg-emerald-400" />
            Muntazam yangilanib turadi
          </div>
        </aside>
      </section>

      {/* ------------------------------- KONTENT ------------------------------- */}
      <section className="mt-10">
        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[22rem] w-full rounded-[2rem]" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          </div>
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : items.length === 0 ? (
          <EmptyState
            title="Hozircha yangilik yo'q"
            description="Yangiliklar qo'shilgach shu yerda paydo bo'ladi."
          />
        ) : (
          <>
            {featured ? <FeaturedNews item={featured} /> : null}

            {rest.length > 0 ? (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                  So&apos;nggi xabarlar
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((item, index) => (
                    <NewsCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
