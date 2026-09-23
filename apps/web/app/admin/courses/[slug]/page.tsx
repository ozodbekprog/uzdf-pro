"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { api, type CourseDetail, type Lesson } from "@/lib/api";
import {
  getAdminQuizzes,
  saveAdminQuiz,
  type AdminQuiz,
  type AdminQuizInput,
} from "@/lib/admin-api";

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const DEFAULT_MIN_READ_SECONDS = 60;
const DEFAULT_PASS_SCORE = 60;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

interface LessonDraft {
  title: string;
  content: string;
  videoUrl: string;
  position: number;
  minReadSeconds: number;
}

interface NewLessonDraft {
  title: string;
  content: string;
  videoUrl: string;
  minReadSeconds: number;
}

interface QuestionDraft {
  text: string;
  options: string[];
  correct: number;
}

interface QuizDraft {
  title: string;
  passScore: number;
  questions: QuestionDraft[];
}

const EMPTY_NEW_LESSON: NewLessonDraft = {
  title: "",
  content: "",
  videoUrl: "",
  minReadSeconds: DEFAULT_MIN_READ_SECONDS,
};

function emptyQuestion(): QuestionDraft {
  return { text: "", options: ["", ""], correct: 0 };
}

function toInt(value: string, fallback: number, min: number, max?: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const truncated = Math.trunc(parsed);
  const clamped = Math.max(min, truncated);
  return max === undefined ? clamped : Math.min(max, clamped);
}

function lessonToDraft(lesson: Lesson): LessonDraft {
  return {
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl ?? "",
    position: lesson.position,
    minReadSeconds: lesson.minReadSeconds,
  };
}

function quizToDraft(quiz: AdminQuiz | undefined): QuizDraft {
  if (!quiz) {
    return { title: "", passScore: DEFAULT_PASS_SCORE, questions: [emptyQuestion()] };
  }

  const questions = [...quiz.questions]
    .sort((a, b) => a.position - b.position)
    .map((question) => {
      const options = question.options.length >= MIN_OPTIONS ? [...question.options] : ["", ""];
      const correct = Math.max(0, Math.min(question.correct, options.length - 1));
      return { text: question.text, options, correct };
    });

  return {
    title: quiz.title,
    passScore: quiz.passScore,
    questions: questions.length > 0 ? questions : [emptyQuestion()],
  };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <CourseAdmin key={slug} slug={slug} />;
}

function CourseAdmin({ slug }: { slug: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newLesson, setNewLesson] = useState<NewLessonDraft>(EMPTY_NEW_LESSON);
  const [addingLesson, setAddingLesson] = useState(false);

  const [quizDraft, setQuizDraft] = useState<QuizDraft | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const fetchCourse = useCallback(async (): Promise<CourseDetail> => {
    const data = await api<{ ok: true; course: CourseDetail }>(
      `/api/v1/courses/manage/${slug}`,
      {},
      true
    );
    return data.course;
  }, [slug]);

  const applyCourse = useCallback((data: CourseDetail) => {
    setCourse(data);
    setSelectedLessonId((prev) =>
      prev && data.lessons.some((lesson) => lesson.id === prev)
        ? prev
        : data.lessons[0]?.id ?? null
    );
  }, []);

  const reloadCourse = useCallback(async () => {
    const fresh = await fetchCourse();
    applyCourse(fresh);
    return fresh;
  }, [fetchCourse, applyCourse]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourse();
        if (!active) return;
        applyCourse(data);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }

      try {
        const list = await getAdminQuizzes();
        if (active) setQuizzes(list);
      } catch {
        if (active) setQuizzes([]);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [fetchCourse, applyCourse]);

  useEffect(() => {
    const lesson = course?.lessons.find((item) => item.id === selectedLessonId) ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dars tanlanganda forma qoralamasini tiklash
    setLessonDraft(lesson ? lessonToDraft(lesson) : null);
  }, [course, selectedLessonId]);

  useEffect(() => {
    if (!selectedLessonId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- dars tanlanmaganda test formasini tozalash
      setQuizDraft(null);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dars tanlanganda test qoralamasini tiklash
    setQuizDraft(quizToDraft(quizzes.find((quiz) => quiz.lessonId === selectedLessonId)));
  }, [quizzes, selectedLessonId]);

  function patchLesson(patch: Partial<LessonDraft>) {
    setLessonDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function selectLesson(lessonId: string) {
    if (lessonId === selectedLessonId) return;
    setSelectedLessonId(lessonId);
    setError(null);
    setNotice(null);
  }

  async function handleSaveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLessonId || !lessonDraft || !lessonValid || savingLesson) return;

    setSavingLesson(true);
    setError(null);
    setNotice(null);

    try {
      const data = await api<{ ok: true; lesson: Lesson }>(
        `/api/v1/courses/lessons/${selectedLessonId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: lessonDraft.title.trim(),
            content: lessonDraft.content,
            videoUrl: lessonDraft.videoUrl.trim() ? lessonDraft.videoUrl.trim() : null,
            position: lessonDraft.position,
            minReadSeconds: lessonDraft.minReadSeconds,
          }),
        },
        true
      );
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons
                .map((lesson) => (lesson.id === data.lesson.id ? data.lesson : lesson))
                .sort((a, b) => a.position - b.position),
            }
          : prev
      );
      setNotice("Dars saqlandi.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleAddLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course || !addValid || addingLesson) return;

    setAddingLesson(true);
    setError(null);
    setNotice(null);

    try {
      const data = await api<{ ok: true; lesson: Lesson }>(
        `/api/v1/courses/${course.id}/lessons`,
        {
          method: "POST",
          body: JSON.stringify({
            title: newLesson.title.trim(),
            content: newLesson.content,
            videoUrl: newLesson.videoUrl.trim() ? newLesson.videoUrl.trim() : null,
            position: nextPosition,
            minReadSeconds: newLesson.minReadSeconds,
          }),
        },
        true
      );
      await reloadCourse();
      setNewLesson(EMPTY_NEW_LESSON);
      setShowAdd(false);
      setSelectedLessonId(data.lesson.id);
      setNotice("Yangi dars qo'shildi.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAddingLesson(false);
    }
  }

  async function handleDeleteLesson(lesson: Lesson) {
    if (!window.confirm(`"${lesson.title}" darsini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setError(null);
    setNotice(null);
    try {
      await api(`/api/v1/courses/lessons/${lesson.id}`, { method: "DELETE" }, true);
      const fresh = await reloadCourse();
      setQuizzes((prev) => prev.filter((quiz) => quiz.lessonId !== lesson.id));
      setSelectedLessonId((prev) =>
        prev === lesson.id ? fresh.lessons[0]?.id ?? null : prev
      );
      setNotice("Dars o'chirildi.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSaveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLessonId || !quizDraft || !quizValid || savingQuiz) return;

    setSavingQuiz(true);
    setError(null);
    setNotice(null);

    try {
      const input: AdminQuizInput = {
        title: quizDraft.title.trim(),
        passScore: quizDraft.passScore,
        questions: quizDraft.questions.map((question) => ({
          text: question.text.trim(),
          options: question.options.map((option) => option.trim()),
          correct: question.correct,
        })),
      };
      const saved = await saveAdminQuiz(selectedLessonId, input);
      setQuizzes((prev) => [
        ...prev.filter((quiz) => quiz.lessonId !== saved.lessonId),
        saved,
      ]);
      setNotice("Test saqlandi.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingQuiz(false);
    }
  }

  function addQuestion() {
    setQuizDraft((prev) =>
      prev ? { ...prev, questions: [...prev.questions, emptyQuestion()] } : prev
    );
  }

  function removeQuestion(index: number) {
    setQuizDraft((prev) =>
      prev
        ? { ...prev, questions: prev.questions.filter((_, item) => item !== index) }
        : prev
    );
  }

  function patchQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuizDraft((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((question, item) =>
              item === index ? { ...question, ...patch } : question
            ),
          }
        : prev
    );
  }

  function patchOption(questionIndex: number, optionIndex: number, value: string) {
    setQuizDraft((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((question, item) =>
              item === questionIndex
                ? {
                    ...question,
                    options: question.options.map((option, inner) =>
                      inner === optionIndex ? value : option
                    ),
                  }
                : question
            ),
          }
        : prev
    );
  }

  function addOption(questionIndex: number) {
    setQuizDraft((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((question, item) =>
              item === questionIndex && question.options.length < MAX_OPTIONS
                ? { ...question, options: [...question.options, ""] }
                : question
            ),
          }
        : prev
    );
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuizDraft((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((question, item) => {
              if (item !== questionIndex || question.options.length <= MIN_OPTIONS) {
                return question;
              }
              const options = question.options.filter((_, inner) => inner !== optionIndex);
              let correct = question.correct;
              if (optionIndex < correct) correct -= 1;
              if (correct >= options.length) correct = options.length - 1;
              return { ...question, options, correct };
            }),
          }
        : prev
    );
  }

  const selectedLesson =
    course?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  const nextPosition = (course?.lessons.length ?? 0) + 1;
  const hasQuiz = quizzes.some((quiz) => quiz.lessonId === selectedLessonId);

  const lessonValid =
    lessonDraft !== null &&
    lessonDraft.title.trim().length > 0 &&
    lessonDraft.content.trim().length > 0;

  const addValid =
    newLesson.title.trim().length > 0 && newLesson.content.trim().length > 0;

  const quizValid =
    quizDraft !== null &&
    quizDraft.title.trim().length > 0 &&
    quizDraft.questions.length > 0 &&
    quizDraft.questions.every(
      (question) =>
        question.text.trim().length > 0 &&
        question.options.length >= MIN_OPTIONS &&
        question.options.every((option) => option.trim().length > 0) &&
        question.correct >= 0 &&
        question.correct < question.options.length
    );

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title={course?.title ?? "Kurs boshqaruvi"}
        subtitle={course?.description ?? undefined}
        actions={
          <Link
            href="/admin/courses"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            ← Kurslarga qaytish
          </Link>
        }
      />

      {error ? (
        <Alert tone="error" className="fade-up mt-6">
          {error}
        </Alert>
      ) : null}

      {notice ? (
        <Alert tone="success" className="fade-up mt-6">
          {notice}
        </Alert>
      ) : null}

      {loading ? (
        <div className="fade-up mt-6 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-24" />
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-14 w-full" />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : !course ? (
        <div className="fade-up mt-6">
          <EmptyState
            title="Kurs topilmadi"
            description="Kurs mavjud emas yoki hali nashr qilinmagan."
            actionLabel="Kurslarga qaytish"
            actionHref="/admin/courses"
          />
        </div>
      ) : (
        <div className="fade-up mt-6 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-3 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Darslar
              </h2>
              <Badge tone="neutral">{course.lessons.length} ta</Badge>
            </div>

            {course.lessons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-neutral-500">
                Hozircha darslar yo&apos;q.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {course.lessons.map((lesson) => {
                  const active = lesson.id === selectedLessonId;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => selectLesson(lesson.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                          active
                            ? "border-sky-400/60 bg-sky-500/10 ring-1 ring-sky-400/40"
                            : "border-white/10 bg-white/[0.03] hover:border-sky-400/40 hover:bg-white/[0.06]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                            active
                              ? "border-sky-400/60 bg-sky-500/15 text-sky-300"
                              : "border-white/10 bg-white/5 text-neutral-400"
                          )}
                        >
                          {lesson.position}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              active ? "text-white" : "text-neutral-200"
                            )}
                          >
                            {lesson.title}
                          </span>
                          <span className="truncate text-xs text-neutral-500">
                            {lesson.minReadSeconds} soniya
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}

          </aside>

          <section className="flex min-w-0 flex-col gap-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Yangi dars qo&apos;shish
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Pozitsiya avtomatik: {nextPosition}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAdd((value) => !value)}
                >
                  {showAdd ? "Yopish" : "+ Dars qo'shish"}
                </Button>
              </div>

              {showAdd ? (
                <form onSubmit={handleAddLesson} className="mt-4 flex flex-col gap-4">
                  <Field label="Sarlavha">
                    <Input
                      value={newLesson.title}
                      onChange={(event) =>
                        setNewLesson((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Dars sarlavhasi"
                    />
                  </Field>

                  <Field label="Matn">
                    <Textarea
                      rows={6}
                      value={newLesson.content}
                      onChange={(event) =>
                        setNewLesson((prev) => ({ ...prev, content: event.target.value }))
                      }
                      placeholder="Dars matni..."
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Video havolasi" hint="Ixtiyoriy">
                      <Input
                        value={newLesson.videoUrl}
                        onChange={(event) =>
                          setNewLesson((prev) => ({ ...prev, videoUrl: event.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </Field>
                    <Field label="Minimal o&apos;qish vaqti (soniya)">
                      <Input
                        type="number"
                        min={0}
                        value={newLesson.minReadSeconds}
                        onChange={(event) =>
                          setNewLesson((prev) => ({
                            ...prev,
                            minReadSeconds: toInt(event.target.value, 0, 0),
                          }))
                        }
                      />
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={!addValid || addingLesson}>
                      {addingLesson ? "Qo'shilmoqda..." : "Dars qo'shish"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAdd(false);
                        setNewLesson(EMPTY_NEW_LESSON);
                      }}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </form>
              ) : null}
            </Card>

            {selectedLesson && lessonDraft ? (
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">
                      Darsni tahrirlash
                    </h2>
                    <Badge tone="sky">#{selectedLesson.position}</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteLesson(selectedLesson)}
                  >
                    Darsni o&apos;chirish
                  </Button>
                </div>

                <form onSubmit={handleSaveLesson} className="mt-4 flex flex-col gap-4">
                  <Field label="Sarlavha">
                    <Input
                      value={lessonDraft.title}
                      onChange={(event) => patchLesson({ title: event.target.value })}
                    />
                  </Field>

                  <Field label="Matn" hint="Darsning asosiy matni">
                    <Textarea
                      rows={12}
                      className="min-h-48"
                      value={lessonDraft.content}
                      onChange={(event) => patchLesson({ content: event.target.value })}
                      placeholder="Dars matni..."
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Video havolasi" hint="Ixtiyoriy (https://...)">
                      <Input
                        value={lessonDraft.videoUrl}
                        onChange={(event) => patchLesson({ videoUrl: event.target.value })}
                        placeholder="https://..."
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Pozitsiya">
                        <Input
                          type="number"
                          min={1}
                          value={lessonDraft.position}
                          onChange={(event) =>
                            patchLesson({ position: toInt(event.target.value, 1, 1) })
                          }
                        />
                      </Field>
                      <Field label="Min. vaqt (s)">
                        <Input
                          type="number"
                          min={0}
                          value={lessonDraft.minReadSeconds}
                          onChange={(event) =>
                            patchLesson({ minReadSeconds: toInt(event.target.value, 0, 0) })
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={!lessonValid || savingLesson}>
                      {savingLesson ? "Saqlanmoqda..." : "Darsni saqlash"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <EmptyState
                title="Darsni tanlang"
                description="Chapdagi ro'yxatdan darsni tanlang yoki yangi dars qo'shing."
              />
            )}

            {selectedLesson && quizDraft ? (
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-white">Test muharriri</h2>
                    {hasQuiz ? (
                      <Badge tone="emerald">Mavjud test</Badge>
                    ) : (
                      <Badge tone="neutral">Yangi test</Badge>
                    )}
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                    + Savol qo&apos;shish
                  </Button>
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Har bir savolda 2 tadan 6 tagacha variant. To&apos;g&apos;ri javobni
                  radio orqali belgilang.
                </p>

                <form onSubmit={handleSaveQuiz} className="mt-4 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                    <Field label="Test sarlavhasi">
                      <Input
                        value={quizDraft.title}
                        onChange={(event) =>
                          setQuizDraft((prev) =>
                            prev ? { ...prev, title: event.target.value } : prev
                          )
                        }
                        placeholder="Masalan: 1-dars bo'yicha test"
                      />
                    </Field>
                    <Field label="O&apos;tish balli (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={quizDraft.passScore}
                        onChange={(event) =>
                          setQuizDraft((prev) =>
                            prev
                              ? { ...prev, passScore: toInt(event.target.value, 0, 0, 100) }
                              : prev
                          )
                        }
                      />
                    </Field>
                  </div>

                  {quizDraft.questions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-neutral-500">
                      Savollar yo&apos;q. &laquo;Savol qo&apos;shish&raquo; tugmasi bilan
                      boshlang.
                    </p>
                  ) : (
                    quizDraft.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-neutral-300">
                            Savol {questionIndex + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            O&apos;chirish
                          </Button>
                        </div>

                        <Field label="Savol matni" className="mt-3">
                          <Textarea
                            rows={2}
                            value={question.text}
                            onChange={(event) =>
                              patchQuestion(questionIndex, { text: event.target.value })
                            }
                            placeholder="Savol matni..."
                          />
                        </Field>

                        <div className="mt-3 flex flex-col gap-2">
                          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Variantlar
                          </span>
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/60 px-3 py-2"
                            >
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={question.correct === optionIndex}
                                onChange={() =>
                                  patchQuestion(questionIndex, { correct: optionIndex })
                                }
                                aria-label={`${optionIndex + 1}-variantni to'g'ri deb belgilash`}
                                className="h-4 w-4 shrink-0 accent-emerald-500"
                              />
                              <input
                                value={option}
                                onChange={(event) =>
                                  patchOption(questionIndex, optionIndex, event.target.value)
                                }
                                placeholder={`${optionIndex + 1}-variant`}
                                className="w-full bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-500"
                              />
                              <button
                                type="button"
                                disabled={question.options.length <= MIN_OPTIONS}
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                aria-label="Variantni o'chirish"
                                className="shrink-0 rounded-lg px-2 py-1 text-sm text-red-300 transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-40"
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="self-start"
                            disabled={question.options.length >= MAX_OPTIONS}
                            onClick={() => addOption(questionIndex)}
                          >
                            + Variant qo&apos;shish
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                      + Savol qo&apos;shish
                    </Button>
                    <Button type="submit" disabled={!quizValid || savingQuiz}>
                      {savingQuiz ? "Saqlanmoqda..." : "Testni saqlash"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : null}

          </section>
        </div>
      )}
    </div>
  );
}

