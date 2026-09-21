"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import {
  clearTokens,
  getMe,
  getRating,
  getTokens,
  type PublicUser,
  type RatingUser,
} from "@/lib/api";

const POSITION_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-300 to-amber-600 text-neutral-950",
  2: "bg-gradient-to-br from-violet-300 to-violet-600 text-neutral-950",
  3: "bg-gradient-to-br from-sky-300 to-sky-600 text-neutral-950",
};

export default function RatingPage() {
  const router = useRouter();
  const [users, setUsers] = useState<RatingUser[]>([]);
  const [me, setMe] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getTokens()) {
      router.replace("/login");
      return;
    }

    let active = true;

    Promise.allSettled([getRating(20), getMe()]).then(
      ([ratingResult, meResult]) => {
        if (!active) return;

        if (ratingResult.status === "fulfilled") {
          setUsers(ratingResult.value);
        } else {
          const message =
            ratingResult.reason instanceof Error
              ? ratingResult.reason.message
              : "Reytingni yuklab bo'lmadi";
          setError(message);
          if (/401|unauthorized|token/i.test(message)) {
            clearTokens();
            router.replace("/login");
          }
        }

        if (meResult.status === "fulfilled") {
          setMe(meResult.value);
        }

        setLoading(false);
      }
    );

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <AppShell>
      <main className="fade-up mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8">
          <PageHeader title="Reyting" subtitle="Eng faol uchuvchilar" />

          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : users.length === 0 ? (
            <EmptyState
              title="Reyting hali bo'sh"
              description="Darslarni yakunlab EXP to'plang va reytingda ko'tariling."
              actionLabel="Akademiyaga o'tish"
              actionHref="/academy"
            />
          ) : (
            <ol className="flex flex-col gap-3">
              {users.map((item) => {
                const isMe = me?.id === item.id;

                return (
                  <li key={item.id}>
                    <Card
                      hover
                      className={cn(
                        "flex items-center gap-4 p-4 sm:p-5",
                        isMe && "ring-1 ring-sky-500/50"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold",
                          POSITION_STYLES[item.position] ??
                            "border border-white/10 bg-white/5 text-neutral-300"
                        )}
                      >
                        {item.position}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.fullName}
                          {isMe ? (
                            <span className="ml-2 text-xs font-medium text-sky-400">
                              Siz
                            </span>
                          ) : null}
                        </p>
                        <Badge tone="sky" className="mt-1.5">
                          Daraja {item.level}
                        </Badge>
                      </div>

                      <span className="shrink-0 text-right text-sm font-semibold text-sky-400">
                        {item.exp}{" "}
                        <span className="text-xs font-medium text-neutral-500">
                          EXP
                        </span>
                      </span>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>
    </AppShell>
  );
}
