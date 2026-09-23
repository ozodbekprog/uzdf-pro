"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { cn } from "@/lib/cn";
import {
  deleteAdminQuiz,
  getAdminQuizzes,
  type AdminQuestion,
  type AdminQuiz,
} from "@/lib/admin-api";

const SHELL = "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10";

const OPTION_LETTER = (index: number) => String.fromCharCode(65 + index);

function Questions({ questions }: { questions: AdminQuestion[] }) {
  if (questions.length === 0) {
    return (
      <p className="px-4 py-4 text-sm text-neutral-500">
        Bu testga hali savol qo&apos;shilmagan.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4 border-t border-white/5 px-4 py-4">
      {questions.map((question, questionIndex) => (
        <li key={question.id}>
          <p className="text-sm font-medium text-neutral-100">
            <span className="mr-1 text-neutral-500">{questionIndex + 1}.</span>
            {question.text}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {question.options.map((option, optionIndex) => {
              const correct = optionIndex === question.correct;
              return (
                <li
                  key={`${question.id}-${optionIndex}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    correct
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.02] text-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "font-medium",
                      correct ? "text-emerald-300" : "text-neutral-500"
                    )}
                  >
                    {OPTION_LETTER(optionIndex)}.
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                  {correct ? <Badge tone="emerald">To&apos;g&apos;ri</Badge> : null}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAdminQuizzes()
      .then((data) => {
        if (active) setQuizzes(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(quiz: AdminQuiz) {
    if (!window.confirm(`"${quiz.title}" testini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setDeletingId(quiz.id);
    setError(null);
    try {
      await deleteAdminQuiz(quiz.id);
      setQuizzes((prev) => prev.filter((item) => item.id !== quiz.id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const totals = quizzes.reduce(
    (acc, quiz) => {
      acc.questions += quiz.questions.length;
      acc.attempts += quiz.attempts;
      acc.passed += quiz.passed;
      return acc;
    },
    { questions: 0, attempts: 0, passed: 0 }
  );

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Testlar"
        subtitle={`Barcha kurslar bo'yicha testlar: ${quizzes.length} ta.`}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            Yangilash
          </Button>
        }
      />

      <section className="fade-up mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami testlar" value={quizzes.length} hint="Barcha testlar" />
        <StatCard
          label="Jami savollar"
          value={totals.questions}
          accent="violet"
          hint="Barcha testlardagi savollar"
        />
        <StatCard
          label="Urinishlar"
          value={totals.attempts}
          accent="amber"
          hint="Jami topshirishlar"
        />
        <StatCard
          label="O'tganlar"
          value={totals.passed}
          accent="emerald"
          hint="Muvaffaqiyatli yakunlaganlar"
        />
      </section>

      <p className="fade-up mt-4 text-sm text-neutral-500">
        Testi yo&apos;q darsga test qo&apos;shish uchun{" "}
        <Link
          href="/admin/courses"
          className="text-sky-400 transition hover:text-sky-300"
        >
          kursni oching
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {loading ? (
          [0, 1].map((item) => (
            <Card key={item} className="fade-up p-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="mt-4 h-20 w-full" />
            </Card>
          ))
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : quizzes.length === 0 ? (
          <EmptyState
            title="Hozircha testlar yo'q"
            description="Test qo'shish uchun kursni oching va darsga test biriktiring."
            actionLabel="Kurslarga o'tish"
            actionHref="/admin/courses"
          />
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="fade-up overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{quiz.title}</h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {quiz.lesson
                      ? `${quiz.lesson.course.title} · ${quiz.lesson.title}`
                      : "Dars biriktirilmagan"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {quiz.lesson ? (
                    <Badge tone="neutral">Dars #{quiz.lesson.position}</Badge>
                  ) : null}
                  <Badge tone="sky">O&apos;tish: {quiz.passScore}%</Badge>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="violet">{quiz.questions.length} savol</Badge>
                  <Badge tone="amber">{quiz.attempts} urinish</Badge>
                  <Badge tone="emerald">{quiz.passed} o&apos;tgan</Badge>
                </div>

                <details className="group mt-4 rounded-xl border border-white/10 bg-neutral-950/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:text-white [&::-webkit-details-marker]:hidden">
                    <span>Savollar ({quiz.questions.length})</span>
                    <span className="text-neutral-500 transition group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <Questions questions={quiz.questions} />
                </details>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {quiz.lesson ? (
                    <Link
                      href={`/admin/courses/${quiz.lesson.course.slug}`}
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      Tahrirlash
                    </Link>
                  ) : (
                    <Link
                      href="/admin/courses"
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      Kursni ochish
                    </Link>
                  )}
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(quiz)}
                    disabled={deletingId === quiz.id}
                  >
                    {deletingId === quiz.id ? "O'chirilmoqda..." : "O'chirish"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
