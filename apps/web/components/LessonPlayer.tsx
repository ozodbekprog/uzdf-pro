"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { completeLesson, startLesson, type Lesson } from "@/lib/api";

interface LessonPlayerProps {
  lesson: Lesson;
  completed: boolean;
  onCompleted: (totalExp?: number) => void;
}

export default function LessonPlayer({ lesson, completed, onCompleted }: LessonPlayerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const counting = remaining !== null && remaining > 0;

  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => (value === null ? null : Math.max(0, value - 1)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  async function handleStart() {
    setError(null);
    setMessage(null);
    setStarting(true);
    try {
      await startLesson(lesson.id);
      setRemaining(lesson.minReadSeconds);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  }

  async function handleComplete() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await completeLesson(lesson.id);
      setRemaining(null);
      setMessage(`Sizga +${result.expAwarded} EXP qo'shildi`);
      onCompleted(result.totalExp);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="fade-up flex flex-col gap-4 p-4 sm:p-6">
      {lesson.videoUrl ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
          <video controls className="w-full" src={lesson.videoUrl} />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-neutral-950/60 text-sm text-neutral-500">
          Bu dars matnli
        </div>
      )}

      {completed ? (
        <Badge tone="emerald" className="self-start">
          Yakunlangan
        </Badge>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={remaining === null ? handleStart : handleComplete}
            disabled={remaining === null ? starting : remaining > 0 || submitting}
          >
            {remaining === null
              ? starting
                ? "Boshlanmoqda..."
                : "Darsni boshlash"
              : submitting
                ? "Yakunlanmoqda..."
                : "Darsni yakunlash"}
          </Button>
          {counting ? (
            <Badge tone="amber">
              Yakunlash uchun {remaining} soniya qoldi
            </Badge>
          ) : null}
        </div>
      )}

      {message ? <Alert tone="success">{message}</Alert> : null}

      {error ? <Alert tone="error">{error}</Alert> : null}
    </Card>
  );
}
