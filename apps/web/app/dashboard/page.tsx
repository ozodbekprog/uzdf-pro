"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
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
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-44 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error || !me || !dashboard) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          <Alert tone="error">
            {error ?? "Ma'lumotlarni yuklab bo'lmadi. Sahifani qayta yuklang."}
          </Alert>
        </div>
      </AppShell>
    );
  }

  const stats = dashboard.stats;
  const courses = dashboard.courses;
  const activeCourse =
    courses.find(
      (course) => course.percent > 0 && course.completedCount < course.lessonsCount
    ) ?? courses.find((course) => course.lessonsCount > 0) ?? null;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6">
          <section className="fade-up flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Salom,{" "}
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                  {me.fullName}
                </span>
                !
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                {me.role} · shaxsiy o&apos;quv kabinetingiz
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="violet">Level {stats.level}</Badge>
              <Badge tone="sky">{stats.exp} EXP</Badge>
              {stats.ratingPosition !== null ? (
                <Badge tone="amber">Reyting #{stats.ratingPosition}</Badge>
              ) : null}
            </div>
          </section>

          <section className="fade-up">
            <Card glow className="p-6">
              {activeCourse ? (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-sky-400">
                      Davom etish
                    </p>
                    <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-white">
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
                    <ProgressBar value={activeCourse.percent} showLabel className="mt-4" />
                  </div>
                  <Link
                    href={`/academy/${activeCourse.slug}`}
                    className={buttonClasses({ size: "lg", className: "shrink-0" })}
                  >
                    Davom etish
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

          <section className="fade-up grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="EXP" value={stats.exp} accent="sky" hint="Umumiy tajriba" />
            <StatCard label="Daraja" value={stats.level} accent="violet" />
            <StatCard
              label="Tugallangan darslar"
              value={stats.completedLessons}
              accent="emerald"
            />
            <StatCard label="Sertifikatlar" value={stats.certificates} accent="amber" />
          </section>

          <section className="fade-up flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Mening kurslarim
              </h2>
              <Link
                href="/my-courses"
                className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
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
                {courses.slice(0, 3).map((course) => (
                  <Card key={course.id} hover className="flex flex-col gap-3 p-5">
                    <div>
                      <h3 className="font-semibold tracking-tight text-white">
                        {course.title}
                      </h3>
                      {course.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                          {course.description}
                        </p>
                      ) : null}
                    </div>
                    <ProgressBar value={course.percent} />
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {course.completedCount}/{course.lessonsCount} dars
                      </span>
                      <Link
                        href={`/academy/${course.slug}`}
                        className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
                      >
                        Kursga o&apos;tish
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="fade-up grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-white">Reyting</h2>
                <Link
                  href="/rating"
                  className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
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
                      className={cn(
                        "rounded-xl",
                        user.position === 1 &&
                          "bg-gradient-to-r from-amber-400 via-sky-400 to-violet-500 p-[1px]"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2",
                          user.position === 1 ? "bg-neutral-950" : "bg-white/[0.03]"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                            user.position === 1
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-neutral-950"
                              : "bg-white/5 text-neutral-400"
                          )}
                        >
                          {user.position}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-200">
                          {user.fullName}
                        </span>
                        <Badge tone="violet" className="hidden sm:inline-flex">
                          Level {user.level}
                        </Badge>
                        <span className="text-xs font-semibold text-sky-400">
                          {user.exp} EXP
                        </span>
                      </div>
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
                  className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
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
                        className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-sky-400/40 hover:bg-white/[0.05]"
                      >
                        <span className="text-sm font-medium text-neutral-200">
                          {certificate.course.title}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(certificate.issuedAt).toLocaleDateString("uz-UZ")}
                        </span>
                        <span className="font-mono text-xs text-sky-400">
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
