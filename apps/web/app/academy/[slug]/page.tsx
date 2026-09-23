"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import LessonPlayer from "@/components/LessonPlayer";
import QuizCard from "@/components/QuizCard";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
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

  function handleCompleted(lessonId: string) {
    setCompletedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          className="fade-up"
          title={course?.title ?? "Akademiya"}
          subtitle={course?.description ?? undefined}
          actions={
            <Link
              href="/academy"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              ← Akademiyaga qaytish
            </Link>
          }
        />

        {loggedIn === false ? (
          <Alert tone="info" className="fade-up">
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
          <div className="fade-up grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-4">
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
        ) : error ? (
          <Alert tone="error" className="fade-up">
            {error}
          </Alert>
        ) : course ? (
          <div className="fade-up grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="flex flex-col gap-4">
              {selectedLesson ? (
                <>
                  <LessonPlayer
                    key={selectedLesson.id}
                    lesson={selectedLesson}
                    completed={completedIds.includes(selectedLesson.id)}
                    onCompleted={() => handleCompleted(selectedLesson.id)}
                  />
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-white">
                      {selectedLesson.title}
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
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

            <aside className="flex flex-col gap-3 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Darslar
              </h2>
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
                          "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                          active
                            ? "border-sky-400/60 bg-sky-500/10 ring-1 ring-sky-400/40"
                            : "border-white/10 bg-white/[0.03] hover:border-sky-400/40 hover:bg-white/[0.06]"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                            active
                              ? "border-sky-400/60 bg-sky-500/15 text-sky-300"
                              : "border-white/10 bg-white/5 text-neutral-400"
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
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
