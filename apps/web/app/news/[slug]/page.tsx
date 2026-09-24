"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { getNews, getNewsItem, type NewsDetail, type NewsItem } from "@/lib/api";

/* ---------------------------------- Ikonkalar ---------------------------------- */

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
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

/* ----------------------------------- Sahifa ----------------------------------- */

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <NewsView key={slug} slug={slug} />;
}

function NewsView({ slug }: { slug: string }) {
  const [item, setItem] = useState<NewsDetail | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getNewsItem(slug);
        if (active) setItem(data);
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
  }, [slug]);

  useEffect(() => {
    let active = true;
    async function loadRelated() {
      try {
        const data = await getNews();
        if (active) setRelated(data.filter((entry) => entry.slug !== slug).slice(0, 3));
      } catch {
        // Tegishli yangiliklar ixtiyoriy — xato bo'lsa blok ko'rsatilmaydi.
      }
    }
    void loadRelated();
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="fade-up mb-7">
        <Link
          href="/news"
          className="glass card-hover inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Barcha yangiliklar
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 sm:p-9">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-5 h-9 w-3/4" />
          <Skeleton className="mt-3 h-9 w-1/2" />
          <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
          <Skeleton className="mt-7 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-5/6" />
          <Skeleton className="mt-3 h-4 w-4/6" />
        </Card>
      ) : error ? (
        <>
          <Alert tone="error">{error}</Alert>
          <div className="mt-4">
            <Link
              href="/news"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Yangiliklarga qaytish
            </Link>
          </div>
        </>
      ) : item ? (
        <article className="fade-up flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {item.category ? <Badge tone="emerald">{item.category}</Badge> : null}
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(item.publishedAt)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {item.title}
            </h1>
            {item.summary ? (
              <p className="max-w-2xl text-lg leading-relaxed text-neutral-400">
                {item.summary}
              </p>
            ) : null}
          </header>

          {item.coverUrl ? (
            <div className="gradient-border relative h-64 w-full overflow-hidden rounded-[1.75rem] sm:h-96">
              <Image
                src={item.coverUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17]/50 to-transparent" />
            </div>
          ) : null}

          <Card className="p-6 sm:p-9">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 text-[1.05rem] leading-8 text-neutral-300">
              {item.body.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Card>

          {related.length > 0 ? (
            <section className="mt-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                Boshqa yangiliklar
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/news/${entry.slug}`}
                    className="group block h-full"
                  >
                    <Card hover className="flex h-full flex-col overflow-hidden">
                      <div className="relative h-36 w-full">
                        {entry.coverUrl ? (
                          <Image
                            src={entry.coverUrl}
                            alt={entry.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 300px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid-bg h-full w-full bg-white/[0.03]" />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-transparent to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        {entry.category ? (
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                            {entry.category}
                          </span>
                        ) : null}
                        <p className="font-display text-sm font-semibold leading-snug text-white">
                          {entry.title}
                        </p>
                        <span className="mt-auto pt-2 text-xs text-neutral-500">
                          {formatDate(entry.publishedAt)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      ) : null}
    </main>
  );
}
