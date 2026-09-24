"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import LessonPlayer from "@/components/LessonPlayer";
import QuizCard from "@/components/QuizCard";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton from "@/components/ui/Skeleton";
import {
  getCourse,
  getProgress,
  getTokens,
  type CourseDetail,
  type Lesson,
} from "@/lib/api";
import { cn } from "@/lib/cn";

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <CourseView key={slug} slug={slug} />;
}

function CourseView({ slug }: { slug: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const hasTokens = getTokens() !== null;

    async function load() {
      try {
        const data = await getCourse(slug);
        if (!active) return;
        setCourse(data);
        setSelectedLessonId(data.lessons[0]?.id ?? null);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) {
          setLoading(false);
          setLoggedIn(hasTokens);
        }
      }

      if (!hasTokens) return;

      try {
        const items = await getProgress();
        if (!active) return;
        setCompletedIds(
          items.filter((item) => item.completedAt).map((item) => item.lesson.id)
        );
      } catch {
        if (active) setCompletedIds([]);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [slug]);

  const selectedLesson: Lesson | null =
    course?.lessons.find((lesson) => lesson.id === selectedLessonId) ??
    course?.lessons[0] ??
    null;

  const totalLessons = course?.lessons.length ?? 0;
  const completedCount = course
    ? course.lessons.filter((lesson) => completedIds.includes(lesson.id)).length
    : 0;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  function handleCompleted(lessonId: string) {
    setCompletedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-6">
        {!loading && !error && course ? (
          <div className="rise rise-1 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/academy"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              <span aria-hidden="true">←</span> Akademiyaga qaytish
            </Link>
            <Badge tone="sky">{totalLessons} ta dars</Badge>
          </div>
        ) : null}

        {loggedIn === false ? (
          <Alert tone="info" className="rise rise-1">
            Progressni saqlash uchun{" "}
            <Link
              href="/login"
              className="font-medium underline underline-offset-2 hover:text-sky-100"
            >
              tizimga kiring
            </Link>
            .
          </Alert>
        ) : null}

        {loading ? (
          <div className="rise rise-1 flex flex-col gap-6">
            <Skeleton className="h-52 w-full rounded-3xl sm:h-64" />
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex flex-col gap-5">
                <Card className="p-6">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="mt-4 h-10 w-40" />
                </Card>
                <Card className="p-6">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-2 h-4 w-4/6" />
                </Card>
              </div>
              <aside className="flex flex-col gap-3">
                <Skeleton className="h-4 w-20" />
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-16 w-full" />
                ))}
              </aside>
            </div>
          </div>
        ) : error ? (
          <Alert tone="error" className="rise rise-1">
            {error}
          </Alert>
        ) : course ? (
          <div className="flex flex-col gap-6">
            {/* ------------------------------ SARLAVHA ------------------------------ */}
            <section className="gradient-border rise rise-2 relative overflow-hidden rounded-3xl">
              <div className="relative on-dark h-56 w-full sm:h-72">
                <Image
                  src={course.coverUrl ?? "/images/course-fpv.png"}
                  alt={course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="emerald">Kurs</Badge>
                    <Badge tone="neutral">{totalLessons} ta dars</Badge>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {course.title}
                  </h1>
                  {course.description ? (
                    <p className="line-clamp-3 max-w-2xl text-sm leading-relaxed text-neutral-300">
                      {course.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ------------------------------ KONTENT ------------------------------ */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="flex flex-col gap-5">
                {selectedLesson ? (
                  <>
                    <LessonPlayer
                      key={selectedLesson.id}
                      lesson={selectedLesson}
                      completed={completedIds.includes(selectedLesson.id)}
                      onCompleted={() => handleCompleted(selectedLesson.id)}
                    />
                    <Card mesh className="rise rise-3 flex flex-col gap-3 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-bold tracking-tight text-white">
                          {selectedLesson.title}
                        </h2>
                        {completedIds.includes(selectedLesson.id) ? (
                          <Badge tone="emerald">Yakunlangan</Badge>
                        ) : null}
                      </div>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">
                        {selectedLesson.content}
                      </p>
                    </Card>
                    <QuizCard key={selectedLesson.id} lessonId={selectedLesson.id} />
                  </>
                ) : (
                  <EmptyState
                    title={"Bu kursda hali darslar yo'q."}
                    description="Darslar qo'shilgach shu yerda paydo bo'ladi."
                  />
                )}
              </section>

              {/* ------------------------------ DARSLAR ------------------------------ */}
              <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                <Card className="flex flex-col gap-5 p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-neutral-400">
                        Darslar
                      </h2>
                      <span className="text-xs font-medium text-neutral-400">
                        {completedCount}/{totalLessons}
                      </span>
                    </div>
                    <ProgressBar value={percent} tone="emerald" showLabel />
                  </div>

                  <ol className="flex flex-col gap-2">
                    {course.lessons.map((lesson) => {
                      const active = lesson.id === selectedLesson?.id;
                      const done = completedIds.includes(lesson.id);
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                              active
                                ? "border-emerald-400/60 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-cyan-500/5 ring-1 ring-emerald-400/40 shadow-[0_20px_45px_-30px_rgba(52,211,153,0.9)]"
                                : "border-white/10 bg-white/[0.03] hover:border-emerald-400/40 hover:bg-white/[0.06]"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                                active
                                  ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-[#04121f]"
                                  : done
                                    ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                    : "border border-white/10 bg-white/5 text-neutral-400"
                              )}
                            >
                              {lesson.position}
                            </span>
                            <span className="flex flex-1 flex-col gap-1.5">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  active ? "text-white" : "text-neutral-200"
                                )}
                              >
                                {lesson.title}
                              </span>
                              {done ? (
                                <Badge tone="emerald" className="self-start">
                                  Yakunlangan
                                </Badge>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </Card>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
