"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getNews, type NewsItem } from "@/lib/api";

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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        className="fade-up"
        title="Yangiliklar"
        subtitle="Dron sohasi, poligonlar, simulyator va akademiya bo'yicha so'nggi xabarlar."
      />

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : items.length === 0 ? (
          <EmptyState
            title="Hozircha yangilik yo'q"
            description="Yangiliklar qo'shilgach shu yerda paydo bo'ladi."
          />
        ) : (
          items.map((item, index) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className={`block rise rise-${(index % 4) + 1}`}
            >
              <Card hover className="flex flex-col overflow-hidden sm:flex-row">
                <div className="relative h-44 w-full shrink-0 sm:h-40 sm:w-72">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 288px"
                      className="object-cover transition duration-500 hover:scale-105"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="grid-bg h-full w-full bg-white/[0.03]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#050a17]/80" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    {item.category ? <Badge tone="emerald">{item.category}</Badge> : null}
                    <span className="text-xs text-neutral-500">
                      {new Date(item.publishedAt).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  {item.summary ? (
                    <p className="text-sm leading-relaxed text-neutral-400">{item.summary}</p>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
