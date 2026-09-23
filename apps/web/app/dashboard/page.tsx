"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
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
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
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
  const shown = useCountUp(value);
  return <>{shown}</>;
}

function StatTile({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <Card hover className="flex items-center gap-4 p-4">
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ring-1",
          tone
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <span className="text-xl font-semibold tracking-tight text-white">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </span>
        {hint ? <span className="truncate text-xs text-neutral-500">{hint}</span> : null}
      </div>
    </Card>
  );
}

function Icons({ name, className }: { name: string; className?: string }) {
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
    default:
      return null;
  }
}

const QUICK_LINKS = [
  { href: "/academy", label: "Akademiya", icon: "book" },
  { href: "/zones", label: "Poligonlar", icon: "map" },
  { href: "/shop", label: "Do'kon", icon: "cart" },
];

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
          <Skeleton className="h-52 w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
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

  const activeCourse =
    courses.find(
      (course) => course.percent > 0 && course.completedCount < course.lessonsCount
    ) ?? courses.find((course) => course.lessonsCount > 0) ?? null;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-6">
          {/* Hero */}
          <section className="rise rise-1 relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Badge tone="emerald">{ROLE_LABEL[me.role] ?? me.role}</Badge>
                  {stats.ratingPosition !== null ? (
                    <Badge tone="amber">Reyting #{stats.ratingPosition}</Badge>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Xush kelibsiz,</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                      {me.fullName}
                    </span>
                  </h1>
                </div>

                <div className="max-w-md">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-300">
                      Keyingi darajaga {toNextLevel} EXP
                    </span>
                    <span className="text-neutral-500">
                      {inLevel}/100
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${inLevel}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-neutral-300 transition hover:border-emerald-400/40 hover:bg-white/[0.07] hover:text-white"
                    >
                      <Icons name={link.icon} className="h-4 w-4 text-emerald-400" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative flex shrink-0 items-center gap-6">
                <div className="relative hidden h-40 w-64 overflow-hidden rounded-2xl border border-white/[0.08] sm:block">
                  <Image
                    src="/images/course-sim.png"
                    alt="DRONCHI milliy simulyatori"
                    fill
                    sizes="256px"
                    className="object-cover opacity-85"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium text-emerald-300">
                    Milliy simulyator
                  </span>
                  <span className="absolute bottom-3 right-3 text-[10px] text-neutral-400">
                    40+ soat
                  </span>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Ring value={inLevel} size={104}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        Daraja
                      </span>
                      <span className="text-2xl font-bold text-white">
                        <AnimatedNumber value={stats.level} />
                      </span>
                    </div>
                  </Ring>
                  <div className="text-center">
                    <span className="block text-lg font-semibold text-emerald-400">
                      <AnimatedNumber value={stats.exp} /> EXP
                    </span>
                    <span className="text-xs text-neutral-500">
                      {toNextLevel} EXP keyingisiga
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistikalar */}
          <section className="rise rise-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Tajriba"
              value={stats.exp}
              hint="Umumiy EXP"
              icon={<Icons name="spark" />}
              tone="border-emerald-400/25 bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
            />
            <StatTile
              label="Daraja"
              value={stats.level}
              hint={`${toNextLevel} EXP keyingisiga`}
              icon={<Icons name="star" />}
              tone="border-cyan-400/25 bg-cyan-400/10 text-cyan-300 ring-cyan-400/20"
            />
            <StatTile
              label="Darslar"
              value={stats.completedLessons}
              hint="Tugallangan"
              icon={<Icons name="book" />}
              tone="border-sky-400/25 bg-sky-400/10 text-sky-300 ring-sky-400/20"
            />
            <StatTile
              label="Sertifikatlar"
              value={stats.certificates}
              hint="Raqamli"
              icon={<Icons name="award" />}
              tone="border-amber-400/25 bg-amber-400/10 text-amber-300 ring-amber-400/20"
            />
          </section>

          {/* Davom etish */}
          <section className="rise rise-3">
            <Card glow className="relative overflow-hidden p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl"
              />
              {activeCourse ? (
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                        <Icons name="play" className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        Davom etish
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-xl font-semibold tracking-tight text-white">
                      {activeCourse.title}
                    </h2>
                    {activeCourse.nextLessonTitle ? (
                      <p className="mt-1 text-sm text-neutral-400">
                        Keyingi dars:{" "}
                        <span className="text-neutral-200">
                          {activeCourse.nextLessonTitle}
                        </span>
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
                          style={{ width: `${activeCourse.percent}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-xs text-neutral-400">
                        {activeCourse.completedCount}/{activeCourse.lessonsCount} dars ·{" "}
                        {activeCourse.percent}%
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/academy/${activeCourse.slug}`}
                    className={buttonClasses({ size: "lg", className: "shrink-0" })}
                  >
                    Darsni davom ettirish
                  </Link>
                </div>
              ) : (
                <EmptyState
                  title="Hali kurs tanlanmagan"
                  description="Akademiyadagi kurslardan birini tanlab, o'qishni boshlang."
                  actionLabel="Akademiyaga o'tish"
                  actionHref="/academy"
                />
              )}
            </Card>
          </section>

          {/* Kurslar */}
          <section className="rise rise-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Mening kurslarim
              </h2>
              <Link
                href="/my-courses"
                className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
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
                {courses.slice(0, 3).map((course, index) => (
                  <Card
                    key={course.id}
                    hover
                    className={cn("flex flex-col overflow-hidden rise", `rise-${index + 1}`)}
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={course.coverUrl ?? "/images/course-fpv.png"}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/40 to-transparent" />
                      <span className="absolute right-3 top-3 grid place-items-center rounded-full border border-white/10 bg-[#050a17]/70 p-1 backdrop-blur">
                        <Ring value={course.percent} size={44} stroke={4}>
                          <span className="text-[10px] font-semibold text-white">
                            {course.percent}%
                          </span>
                        </Ring>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold tracking-tight text-white">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
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
                        className="mt-auto text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                      >
                        Kursga o&apos;tish →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Reyting va sertifikatlar */}
          <div className="rise rise-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-white">Reyting</h2>
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
                  {rating.slice(0, 5).map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                          user.position === 1
                            ? "bg-gradient-to-br from-amber-300 to-orange-500 text-neutral-950"
                            : user.position === 2
                              ? "bg-gradient-to-br from-slate-200 to-slate-400 text-neutral-950"
                              : user.position === 3
                                ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                                : "bg-white/[0.06] text-neutral-400"
                        )}
                      >
                        {user.position}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-200">
                        {user.fullName}
                      </span>
                      <Badge tone="neutral" className="hidden sm:inline-flex">
                        Lv {user.level}
                      </Badge>
                      <span className="text-xs font-semibold text-emerald-400">
                        {user.exp} EXP
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Sertifikatlar
                </h2>
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
                  {certificates.slice(0, 2).map((certificate) => (
                    <li key={certificate.id}>
                      <Link
                        href={`/certificate/${certificate.code}`}
                        className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.05] to-transparent px-4 py-3 transition hover:border-emerald-400/40"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                          <Icons name="award" className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-neutral-100">
                            {certificate.course.title}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(certificate.issuedAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </span>
                        <span className="hidden font-mono text-xs text-emerald-400 sm:block">
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
