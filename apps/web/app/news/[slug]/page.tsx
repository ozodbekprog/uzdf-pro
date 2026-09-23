"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getNewsItem, type NewsDetail } from "@/lib/api";

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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="fade-up mb-6">
        <Link
          href="/news"
          className="text-sm text-neutral-400 underline-offset-4 transition hover:text-white hover:underline"
        >
          ← Barcha yangiliklar
        </Link>
      </div>

      {loading ? (
        <Card className="p-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </Card>
      ) : error ? (
        <>
          <Alert tone="error">{error}</Alert>
          <div className="mt-4">
            <Link href="/news" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Yangiliklarga qaytish
            </Link>
          </div>
        </>
      ) : item ? (
        <article className="fade-up flex flex-col gap-5">
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
          <PageHeader title={item.title} subtitle={item.summary ?? undefined} />
          {item.coverUrl ? (
            <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-white/[0.08] sm:h-72">
              <Image
                src={item.coverUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <Card className="p-6">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-300">
              {item.body.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>
        </article>
      ) : null}
    </main>
  );
}
