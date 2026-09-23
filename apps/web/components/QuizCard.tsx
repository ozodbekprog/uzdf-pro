"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { getLessonQuiz, submitQuiz, type LessonQuiz } from "@/lib/api";
import { useIsAuthed } from "@/lib/auth-store";
import { cn } from "@/lib/cn";

interface QuizCardProps {
  lessonId: string;
}

interface QuizResult {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  expAwarded: number;
}

export default function QuizCard({ lessonId }: QuizCardProps) {
  const authed = useIsAuthed();
  const [quiz, setQuiz] = useState<LessonQuiz | null>(null);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;

    let active = true;

    getLessonQuiz(lessonId)
      .then((data) => {
        if (!active) return;
        setQuiz(data.quiz);
        setPassed(data.lastAttempt?.passed ?? false);
      })
      .catch(() => {
        // Bu dars uchun test yo'q (yoki vaqtincha xato) — blok ko'rsatilmaydi.
        if (active) setQuiz(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lessonId, authed]);

  async function handleSubmit() {
    if (!quiz) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((_, index) => answers[index] ?? -1);
      const response = await submitQuiz(quiz.id, payload);
      setResult({ ...response.attempt, expAwarded: response.expAwarded });
      if (response.attempt.passed) setPassed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Testni yuborib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authed) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </Card>
    );
  }

  if (!quiz) {
    return null;
  }

  const allAnswered = quiz.questions.every((_, index) => answers[index] !== undefined);

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">{quiz.title}</h2>
          <span className="text-xs text-neutral-500">
            {quiz.questions.length} ta savol · o&apos;tish uchun {quiz.passScore}%
          </span>
        </div>
        {passed ? <Badge tone="emerald">Topshirilgan</Badge> : <Badge tone="amber">Test</Badge>}
      </div>

      <ol className="flex flex-col gap-5">
        {quiz.questions.map((question, qIndex) => (
          <li key={question.id} className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-neutral-200">
              {qIndex + 1}. {question.text}
            </span>
            <div
              role="radiogroup"
              aria-label={question.text}
              className="flex flex-col gap-1.5"
            >
              {question.options.map((option, oIndex) => {
                const selected = answers[qIndex] === oIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                    disabled={submitting}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition",
                      selected
                        ? "border-emerald-400/60 bg-emerald-500/10 text-white ring-1 ring-emerald-400/40"
                        : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-emerald-400/40 hover:bg-white/[0.06]"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]",
                        selected
                          ? "border-emerald-400 bg-emerald-400 text-neutral-950"
                          : "border-white/20 text-neutral-500"
                      )}
                    >
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {result ? (
        <Alert tone={result.passed ? "success" : "error"}>
          Natija: {result.score}/{result.total} ({result.percent}%) —{" "}
          {result.passed ? "o'tdingiz!" : "o'ta olmadingiz, qayta urinib ko'ring."}
          {result.expAwarded > 0 ? ` +${result.expAwarded} EXP qo'shildi.` : ""}
        </Alert>
      ) : null}

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
          {submitting ? "Tekshirilmoqda..." : "Testni topshirish"}
        </Button>
        {!allAnswered ? (
          <span className="text-xs text-neutral-500">
            Barcha savollarga javob belgilang
          </span>
        ) : null}
      </div>
    </Card>
  );
}
