"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import AppShell from "@/components/AppShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import {
  getDashboard,
  getMe,
  getMyCertificates,
  getRating,
  getTokens,
  type CertificateItem,
  type DashboardData,
  type PublicUser,
  type RatingUser,
} from "@/lib/api";
import { cn } from "@/lib/cn";

const ROLE_LABEL: Record<string, string> = {
  PILOT: "Uchuvchi",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
  SUPERADMIN: "Superadmin",
};

/* ---------------------------------- Soniya ---------------------------------- */

function Ring({
  value,
  size = 96,
  stroke = 8,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const gradId = `ring-grad-${useId().replace(/:/g, "")}`;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-full bg-emerald-400/15 blur-xl"
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 0 : duration;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = total === 0 ? 1 : Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value }: { value: number }) {
  return <>{useCountUp(value)}</>;
}

/* ---------------------------------- Ikonkalar ---------------------------------- */

type IconName =
  | "spark"
  | "star"
  | "book"
  | "award"
  | "play"
  | "map"
  | "cart"
  | "trophy"
  | "bolt"
  | "arrow"
  | "target"
  | "clock"
  | "news"
  | "shield"
  | "medal";

function Icons({ name, className }: { name: IconName; className?: string }) {
  const common = {
    className: className ?? "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          <path d="m6.3 6.3 2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M10.2 8.6 15.8 12l-5.6 3.4V8.6Z" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="18" cy="20" r="1.3" />
          <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16h8.3a2 2 0 0 0 1.95-1.55L21 8H6" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5a3 3 0 0 0 3 5M16 6h3a3 3 0 0 1-3 5" />
          <path d="M12 13v4M9 20h6" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12l1-7Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2V4Z" />
          <path d="M18 8h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1M8 8h7M8 12h7M8 16h4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="14.5" r="4.5" />
          <path d="m9 10-2.5-6M15 10l2.5-6M6.5 4h11" />
        </svg>
      );
    default:
      return null;
  }
}

/* ---------------------------------- Yordamchi ---------------------------------- */

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface PodiumStyle {
  row: string;
  medal: string;
  label: string;
}

const PODIUM: Record<number, PodiumStyle> = {
  1: {
    row: "border-amber-300/45 bg-gradient-to-r from-amber-400/[0.14] to-transparent",
    medal: "bg-gradient-to-br from-amber-200 to-orange-500 text-neutral-950",
    label: "Oltin",
  },
  2: {
    row: "border-slate-300/40 bg-gradient-to-r from-slate-300/[0.12] to-transparent",
    medal: "bg-gradient-to-br from-slate-100 to-slate-400 text-neutral-950",
    label: "Kumush",
  },
  3: {
    row: "border-amber-700/50 bg-gradient-to-r from-amber-700/[0.16] to-transparent",
    medal: "bg-gradient-to-br from-amber-500 to-amber-800 text-white",
    label: "Bronza",
  },
};

const QUICK_LINKS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/academy", label: "Akademiya", icon: "book" },
  { href: "/zones", label: "Poligonlar", icon: "map" },
  { href: "/shop", label: "Do'kon", icon: "cart" },
  { href: "/rating", label: "Reyting", icon: "trophy" },
];

/* ----------------------------------- Sahifa ----------------------------------- */

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [rating, setRating] = useState<RatingUser[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getTokens() === null) {
      router.replace("/login");
      return;
    }

    let active = true;

    Promise.all([getMe(), getDashboard(), getRating(5), getMyCertificates()])
      .then(([meData, dashboardData, ratingData, certificateData]) => {
        if (!active) return;
        setMe(meData);
        setDashboard(dashboardData);
        setRating(ratingData);
        setCertificates(certificateData);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "Ma'lumotlarni yuklab bo'lmadi"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
          <Skeleton className="h-72 w-full rounded-[2rem]" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-64" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !me || !dashboard) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
          <Alert tone="error">
            {error ?? "Ma'lumotlarni yuklab bo'lmadi. Sahifani qayta yuklang."}
          </Alert>
        </div>
      </AppShell>
    );
  }

  const stats = dashboard.stats;
  const courses = dashboard.courses;
  const inLevel = stats.exp % 100;
  const toNextLevel = 100 - inLevel;
  const roleLabel = ROLE_LABEL[me.role] ?? me.role;

  const activeCourse =
    courses.find(
      (course) => course.percent > 0 && course.completedCount < course.lessonsCount
    ) ?? courses.find((course) => course.lessonsCount > 0) ?? null;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-6">
          {/* -------------------------------- Hero -------------------------------- */}
          <section className="glass rise rise-1 relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="grid-bg pointer-events-none absolute inset-0 opacity-50"
              style={{
                maskImage: "radial-gradient(ellipse at top left, #000 10%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at top left, #000 10%, transparent 70%)",
              }}
            />

            <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
              <div className="flex min-w-0 flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="emerald">{roleLabel}</Badge>
                  {stats.ratingPosition !== null ? (
                    <Badge tone="amber">Reyting #{stats.ratingPosition}</Badge>
                  ) : null}
                  <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium text-emerald-200">
                    <span className="relative flex h-2 w-2">
                      <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Faol o&apos;quvchi
                  </span>
                </div>

                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                    Xush kelibsiz
                  </p>
                  <h1 className="font-display mt-2 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                    <span className="gradient-text">{me.fullName}</span>
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-400">
                    Keyingi darsni tugatib, EXP yig&apos;ishda davom eting va reytingda
                    yuqoriga ko&apos;tariling.
                  </p>
                </div>

                <div className="max-w-xl">
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                      Keyingi daraja
                    </span>
                    <span className="font-display text-sm font-bold text-emerald-300">
                      {inLevel}
                      <span className="text-neutral-500">/100</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 transition-all duration-700"
                      style={{ width: `${inLevel}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Keyingi darajaga yana{" "}
                    <span className="font-medium text-neutral-300">{toNextLevel} EXP</span>{" "}
                    kerak
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="glass group inline-flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-4 text-sm font-medium text-neutral-200 transition hover:border-emerald-400/40 hover:text-white"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.06] text-emerald-300 transition group-hover:bg-emerald-400/15 group-hover:text-emerald-200">
                        <Icons name={link.icon} className="h-4 w-4" />
                      </span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-xs">
                <div className="glass-strong gradient-border relative flex flex-col items-center gap-4 rounded-[2rem] p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                    Daraja
                  </span>
                  <Ring value={inLevel} size={148} stroke={10}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        LVL
                      </span>
                      <span className="font-display text-4xl font-extrabold text-white">
                        <AnimatedNumber value={stats.level} />
                      </span>
                    </div>
                  </Ring>
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-emerald-300">
                      <AnimatedNumber value={stats.exp} /> EXP
                    </p>
                    <p className="text-xs text-neutral-500">Umumiy tajriba</p>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 pt-1">
                    <div className="glass rounded-2xl px-3 py-2.5 text-center">
                      <p className="font-display text-lg font-bold text-white">
                        <AnimatedNumber value={stats.completedLessons} />
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                        Dars
                      </p>
                    </div>
                    <div className="glass rounded-2xl px-3 py-2.5 text-center">
                      <p className="font-display text-lg font-bold text-white">
                        <AnimatedNumber value={stats.certificates} />
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                        Sertifikat
                      </p>
                    </div>
                  </div>
                </div>

                <span className="glass-strong floaty absolute -right-3 top-6 grid h-12 w-12 place-items-center rounded-2xl text-amber-300 sm:-right-5">
                  <Icons name="bolt" className="h-5 w-5" />
                </span>
              </div>
            </div>
          </section>

          {/* ----------------------------- Statistikalar ----------------------------- */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rise rise-1">
              <StatCard
                label="Tajriba"
                value={<AnimatedNumber value={stats.exp} />}
                hint="Umumiy EXP"
                accent="emerald"
                icon={<Icons name="spark" className="h-5 w-5" />}
              />
            </div>
            <div className="rise rise-2">
              <StatCard
                label="Daraja"
                value={<AnimatedNumber value={stats.level} />}
                hint={`${toNextLevel} EXP keyingisiga`}
                accent="sky"
                icon={<Icons name="star" className="h-5 w-5" />}
              />
            </div>
            <div className="rise rise-3">
              <StatCard
                label="Darslar"
                value={<AnimatedNumber value={stats.completedLessons} />}
                hint="Tugallangan"
                accent="violet"
                icon={<Icons name="book" className="h-5 w-5" />}
              />
            </div>
            <div className="rise rise-4">
              <StatCard
                label="Sertifikatlar"
                value={<AnimatedNumber value={stats.certificates} />}
                hint="Raqamli"
                accent="amber"
                icon={<Icons name="award" className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* ------------------------------- Davom etish ------------------------------- */}
          <section className="rise rise-3">
            <Card border glow className="overflow-hidden p-0">
              {activeCourse ? (
                <div className="grid md:grid-cols-[0.85fr_1.15fr]">
                  <div className="relative on-dark min-h-52 md:min-h-full">
                    <Image
                      src={activeCourse.coverUrl ?? "/images/course-fpv.png"}
                      alt={activeCourse.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a17]/95 via-[#050a17]/45 to-transparent md:bg-gradient-to-r md:from-[#050a17]/25 md:via-[#050a17]/50 md:to-[#0a1120]" />
                    <span className="glass-strong absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-emerald-300">
                      <Icons name="play" className="h-6 w-6" />
                    </span>
                    <span className="glass-strong absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                      Davom etish
                    </span>
                  </div>

                  <div className="flex flex-col gap-5 p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      <Icons name="target" className="h-4 w-4" />
                      Faol kurs
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {activeCourse.title}
                      </h2>
                      {activeCourse.nextLessonTitle ? (
                        <p className="mt-2 text-sm text-neutral-400">
                          Keyingi dars:{" "}
                          <span className="font-medium text-neutral-200">
                            {activeCourse.nextLessonTitle}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <div className="mb-2 flex items-end justify-between">
                        <span className="font-display text-3xl font-extrabold gradient-text">
                          {activeCourse.percent}%
                        </span>
                        <span className="text-xs text-neutral-500">
                          {activeCourse.completedCount}/{activeCourse.lessonsCount} dars
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 transition-all duration-700"
                          style={{ width: `${activeCourse.percent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/academy/${activeCourse.slug}`}
                      className={buttonClasses({
                        size: "lg",
                        className: "ring-glow self-start",
                      })}
                    >
                      Darsni davom ettirish
                      <Icons name="arrow" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <EmptyState
                    title="Hali kurs tanlanmagan"
                    description="Akademiyadagi kurslardan birini tanlab, o'qishni boshlang."
                    actionLabel="Akademiyaga o'tish"
                    actionHref="/academy"
                  />
                </div>
              )}
            </Card>
          </section>

          {/* -------------------------------- Kurslar -------------------------------- */}
          <section className="rise rise-4 flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Mening kurslarim
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Yozilgan kurslar va o&apos;zlashtirish jarayoni
                </p>
              </div>
              <Link
                href="/my-courses"
                className="shrink-0 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Barchasi
              </Link>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                title="Kurslar topilmadi"
                description="Hozircha sizda kurslar yo'q. Akademiyadan kurs tanlang."
                actionLabel="Akademiyaga o'tish"
                actionHref="/academy"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {courses.slice(0, 3).map((course, index) => {
                  const done = course.completedCount >= course.lessonsCount;
                  return (
                    <div key={course.id} className={cn("rise", `rise-${index + 1}`)}>
                      <Card hover className="group flex h-full flex-col overflow-hidden">
                        <div className="relative on-dark h-40 w-full">
                          <Image
                            src={course.coverUrl ?? "/images/course-fpv.png"}
                            alt={course.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/40 to-transparent" />
                          <span className="absolute left-3 top-3">
                            <Badge tone={done ? "emerald" : "neutral"}>
                              {done ? "Tugallangan" : `Kurs ${index + 1}`}
                            </Badge>
                          </span>
                          <span className="glass-strong absolute -bottom-7 right-4 grid h-16 w-16 place-items-center rounded-full">
                            <Ring value={course.percent} size={54} stroke={5}>
                              <span className="font-display text-[11px] font-bold text-white">
                                {course.percent}%
                              </span>
                            </Ring>
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 p-5 pt-9">
                          <div className="min-w-0">
                            <h3 className="font-display truncate text-base font-bold tracking-tight text-white">
                              {course.title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                              <Icons name="book" className="h-3.5 w-3.5" />
                              {course.completedCount}/{course.lessonsCount} dars
                            </p>
                          </div>
                          {course.description ? (
                            <p className="line-clamp-2 text-sm text-neutral-400">
                              {course.description}
                            </p>
                          ) : null}
                          <Link
                            href={`/academy/${course.slug}`}
                            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                          >
                            {course.percent > 0 ? "Davom ettirish" : "Boshlash"}
                            <Icons name="arrow" className="h-4 w-4" />
                          </Link>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* --------------------------- Reyting va sertifikatlar --------------------------- */}
          <div className="rise rise-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card mesh className="flex flex-col gap-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                    <Icons name="trophy" className="h-4 w-4" />
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-white">
                    Reyting
                  </h2>
                </div>
                <Link
                  href="/rating"
                  className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                >
                  Barchasi
                </Link>
              </div>

              {rating.length === 0 ? (
                <p className="text-sm text-neutral-500">Reyting hozircha bo&apos;sh.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {rating.slice(0, 5).map((user) => {
                    const podium = PODIUM[user.position];
                    return (
                      <li
                        key={user.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                          podium
                            ? podium.row
                            : "border-white/[0.06] bg-white/[0.02]"
                        )}
                      >
                        <span className="relative shrink-0">
                          <span
                            className={cn(
                              "grid h-9 w-9 place-items-center rounded-full text-xs font-bold",
                              podium
                                ? podium.medal
                                : "bg-white/[0.06] text-neutral-300"
                            )}
                          >
                            {initials(user.fullName)}
                          </span>
                          <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-[#0a1121] bg-[#0a1121] text-[9px] font-bold text-neutral-300">
                            {user.position}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-100">
                            {user.fullName}
                          </span>
                          {podium ? (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                              {podium.label} o&apos;rin
                            </span>
                          ) : null}
                        </span>
                        <Badge tone="neutral" className="hidden sm:inline-flex">
                          Lv {user.level}
                        </Badge>
                        <span className="font-display text-xs font-bold text-emerald-400">
                          {user.exp} EXP
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card border className="flex flex-col gap-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                    <Icons name="award" className="h-4 w-4" />
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-white">
                    Sertifikatlar
                  </h2>
                </div>
                <Link
                  href="/certificates"
                  className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                >
                  Barchasi
                </Link>
              </div>

              {certificates.length === 0 ? (
                <p className="text-sm text-neutral-500">Hali sertifikatlar yo&apos;q.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {certificates.slice(0, 3).map((certificate) => (
                    <li key={certificate.id}>
                      <Link
                        href={`/certificate/${certificate.code}`}
                        className="glass card-hover flex items-center gap-4 rounded-2xl px-4 py-3 hover:border-emerald-400/40"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-neutral-950">
                          <Icons name="medal" className="h-5 w-5" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-neutral-100">
                            {certificate.course.title}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <Icons name="clock" className="h-3.5 w-3.5" />
                            {new Date(certificate.issuedAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </span>
                        <span className="hidden shrink-0 font-mono text-xs text-emerald-400 sm:block">
                          {certificate.code}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
