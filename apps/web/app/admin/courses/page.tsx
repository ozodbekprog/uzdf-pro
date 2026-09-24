"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { api, getCourse, type Lesson } from "@/lib/api";

/** Ro'yxat javobida qo'shimcha `published` maydoni bo'lishi mumkin. */
interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl?: string | null;
  lessonsCount: number;
  published?: boolean;
}

interface AdminCourseListResponse {
  ok: true;
  count: number;
  courses: AdminCourse[];
}

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const DEFAULT_MIN_READ_SECONDS = 60;

/** Bo'sh bo'lmagan butun sonni ajratib oladi, aks holda `fallback`. */
function parseIntOr(value: string, fallback: number, min: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return parsed;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kurs formasi
  const [showForm, setShowForm] = useState(false);
  const [courseEditingId, setCourseEditingId] = useState<string | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(true);

  // Tanlangan kurs va uning darslari
  const [selected, setSelected] = useState<AdminCourse | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  // Dars formasi
  const [lessonEditingId, setLessonEditingId] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonPosition, setLessonPosition] = useState("1");
  const [lessonMinRead, setLessonMinRead] = useState(String(DEFAULT_MIN_READ_SECONDS));

  const refresh = useCallback(async () => {
    const data = await api<AdminCourseListResponse>("/api/v1/courses/manage/all", {}, true);
    setCourses(data.courses);
    // Tanlangan kurs ma'lumotini yangilangan ro'yxat bilan sinxronlash.
    setSelected((prev) =>
      prev ? data.courses.find((course) => course.id === prev.id) ?? null : prev
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  /* ------------------------------ Kurs formasi ------------------------------ */

  function resetCourseDraft() {
    setCourseEditingId(null);
    setSlug("");
    setTitle("");
    setDescription("");
    setCoverUrl("");
    setPublished(true);
  }

  function startCreate() {
    resetCourseDraft();
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function startEditCourse(course: AdminCourse) {
    setCourseEditingId(course.id);
    setSlug(course.slug);
    setTitle(course.title);
    setDescription(course.description ?? "");
    setCoverUrl(course.coverUrl ?? "");
    setPublished(course.published !== false);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function cancelCourseForm() {
    resetCourseDraft();
    setShowForm(false);
  }

  async function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const canSave =
      slug.trim().length >= 2 && title.trim().length >= 2 && !savingCourse;
    if (!canSave) return;

    setSavingCourse(true);
    setError(null);
    setSuccess(null);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      published,
      coverUrl: coverUrl.trim() ? coverUrl.trim() : undefined,
    };

    try {
      if (courseEditingId) {
        await api(
          `/api/v1/courses/${courseEditingId}`,
          { method: "PATCH", body: JSON.stringify(payload) },
          true
        );
        setSuccess("Kurs yangilandi.");
      } else {
        await api(
          "/api/v1/courses",
          { method: "POST", body: JSON.stringify(payload) },
          true
        );
        setSuccess("Yangi kurs yaratildi.");
      }
      cancelCourseForm();
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleCourseDelete(course: AdminCourse) {
    if (!window.confirm(`"${course.title}" kursini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api(`/api/v1/courses/${course.id}`, { method: "DELETE" }, true);
      if (selected?.id === course.id) closeLessons();
      if (courseEditingId === course.id) cancelCourseForm();
      await refresh();
      setSuccess("Kurs o'chirildi.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  /* -------------------------------- Darslar -------------------------------- */

  const loadLessons = useCallback(async (slugValue: string): Promise<Lesson[]> => {
    setLessonsLoading(true);
    setLessonsError(null);
    try {
      const detail = await getCourse(slugValue);
      setLessons(detail.lessons);
      return detail.lessons;
    } catch (err) {
      setLessons([]);
      setLessonsError((err as Error).message);
      return [];
    } finally {
      setLessonsLoading(false);
    }
  }, []);

  function selectCourse(course: AdminCourse) {
    setError(null);
    setSuccess(null);

    if (selected?.id === course.id) {
      closeLessons();
      return;
    }

    setSelected(course);
    resetLessonDraft(0);
    void loadLessons(course.slug).then((list) => resetLessonDraft(list.length));
  }

  function closeLessons() {
    setSelected(null);
    setLessons([]);
    setLessonsError(null);
    resetLessonDraft(0);
  }

  function resetLessonDraft(positionCount: number) {
    setLessonEditingId(null);
    setLessonTitle("");
    setLessonContent("");
    setLessonVideoUrl("");
    setLessonPosition(String(positionCount + 1));
    setLessonMinRead(String(DEFAULT_MIN_READ_SECONDS));
  }

  function startLessonEdit(lesson: Lesson) {
    setLessonEditingId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
    setLessonVideoUrl(lesson.videoUrl ?? "");
    setLessonPosition(String(lesson.position));
    setLessonMinRead(String(lesson.minReadSeconds));
    setError(null);
    setSuccess(null);
  }

  async function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const position = Number.parseInt(lessonPosition, 10);
    const minReadSeconds = Number.parseInt(lessonMinRead, 10);
    const canSave =
      lessonTitle.trim().length > 0 &&
      lessonContent.trim().length > 0 &&
      Number.isInteger(position) &&
      position >= 1 &&
      Number.isInteger(minReadSeconds) &&
      minReadSeconds >= 0 &&
      !savingLesson;
    if (!canSave) return;

    setSavingLesson(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title: lessonTitle.trim(),
      content: lessonContent.trim(),
      videoUrl: lessonVideoUrl.trim() ? lessonVideoUrl.trim() : null,
      position,
      minReadSeconds,
    };

    try {
      if (lessonEditingId) {
        await api(
          `/api/v1/courses/lessons/${lessonEditingId}`,
          { method: "PATCH", body: JSON.stringify(payload) },
          true
        );
        setSuccess("Dars yangilandi.");
      } else {
        await api(
          `/api/v1/courses/${selected.id}/lessons`,
          { method: "POST", body: JSON.stringify(payload) },
          true
        );
        setSuccess("Yangi dars qo'shildi.");
      }
      const list = await loadLessons(selected.slug);
      await refresh();
      resetLessonDraft(list.length);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleLessonDelete(lesson: Lesson) {
    if (!selected) return;
    if (!window.confirm(`"${lesson.title}" darsini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api(`/api/v1/courses/lessons/${lesson.id}`, { method: "DELETE" }, true);
      const list = await loadLessons(selected.slug);
      await refresh();
      resetLessonDraft(list.length);
      setSuccess("Dars o'chirildi.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleRefresh() {
    setError(null);
    setSuccess(null);
    refresh().catch((err: Error) => setError(err.message));
  }

  const nextLessonPosition = lessons.length + 1;
  const lessonCanSave =
    lessonTitle.trim().length > 0 &&
    lessonContent.trim().length > 0 &&
    parseIntOr(lessonPosition, 0, 1) >= 1 &&
    parseIntOr(lessonMinRead, -1, 0) >= 0 &&
    !savingLesson;

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Kurslar va darslar"
        subtitle="Kurslarni yarating, tahrirlang va ularning darslarini boshqaring."
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              Yangilash
            </Button>
            <Button type="button" size="sm" onClick={startCreate}>
              Yangi kurs
            </Button>
          </>
        }
      />

      {error ? (
        <Alert tone="error" className="fade-up mt-6">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert tone="success" className="fade-up mt-6">
          {success}
        </Alert>
      ) : null}

      {showForm ? (
        <Card className="fade-up mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              {courseEditingId ? "Kursni tahrirlash" : "Yangi kurs"}
            </h2>
            {courseEditingId ? <Badge tone="sky">Tahrirlanmoqda</Badge> : null}
          </div>

          <form
            onSubmit={handleCourseSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Slug" hint="Faqat lotin harflari, masalan: fpv-asoslari">
              <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="fpv-asoslari"
              />
            </Field>

            <Field label="Sarlavha">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="FPV dron asoslari"
              />
            </Field>

            <Field
              label="Muqova rasmi (URL)"
              hint="Ixtiyoriy — to'liq rasm manzili"
              className="sm:col-span-2"
            >
              <Input
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>

            <Field label="Tavsif" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Kurs haqida qisqacha ma'lumot"
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm transition hover:border-sky-400/40">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-4 w-4 accent-sky-500"
              />
              <span className="font-medium text-neutral-300">
                Nashr qilingan
              </span>
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button
                type="submit"
                disabled={
                  slug.trim().length < 2 ||
                  title.trim().length < 2 ||
                  savingCourse
                }
              >
                {savingCourse ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelCourseForm}
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <section className="fade-up mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="flex flex-col gap-4 p-5">
              <Skeleton className="h-36" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-8 w-40" />
            </Card>
          ))}
        </section>
      ) : courses.length === 0 ? (
        <div className="fade-up mt-6">
          <EmptyState
            title="Hozircha kurslar yo'q"
            description="Birinchi kursni yaratish uchun yuqoridagi «Yangi kurs» tugmasidan foydalaning."
          />
        </div>
      ) : (
        <section className="fade-up mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const isActive = selected?.id === course.id;
            const isDraft = course.published === false;
            return (
              <Card
                key={course.id}
                className={cn(
                  "flex flex-col overflow-hidden transition",
                  isDraft && "opacity-80",
                  isActive && "ring-1 ring-sky-400/50"
                )}
              >
                <div className="relative on-dark h-36 w-full">
                  {course.coverUrl ? (
                    <Image
                      src={course.coverUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid-bg h-full w-full bg-white/[0.03]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/20 to-transparent" />
                  <span className="absolute right-3 top-3">
                    <Badge tone={isDraft ? "amber" : "emerald"}>
                      {isDraft ? "Qoralama" : "Nashr qilingan"}
                    </Badge>
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {course.title}
                    </h3>
                    <Badge tone="neutral">{course.lessonsCount} ta dars</Badge>
                  </div>
                  <p className="text-xs text-neutral-500">/{course.slug}</p>
                  {course.description ? (
                    <p className="flex-1 text-sm text-neutral-400">
                      {course.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => selectCourse(course)}
                    >
                      {isActive ? "Darslar ochiq" : "Darslar"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startEditCourse(course)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleCourseDelete(course)}
                    >
                      O&apos;chirish
                    </Button>
                    <Link
                      href={`/academy/${course.slug}`}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                    >
                      Ko&apos;rish
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {selected ? (
        <Card className="fade-up mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-white">
                Darslar — {selected.title}
              </h2>
              <p className="text-xs text-neutral-500">/{selected.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{lessons.length} ta dars</Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeLessons}
              >
                Yopish
              </Button>
            </div>
          </div>

          {lessonsError ? (
            <div className="p-5">
              <Alert tone="error">{lessonsError}</Alert>
            </div>
          ) : null}

          {lessonsLoading ? (
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Darslar yo'q"
                description="Bu kursga hali dars qo'shilmagan. Quyidagi forma orqali birinchi darsni qo'shing."
              />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition",
                    lessonEditingId === lesson.id
                      ? "bg-sky-500/5"
                      : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sky">#{lesson.position}</Badge>
                      <p className="truncate font-medium text-neutral-100">
                        {lesson.title}
                      </p>
                      <Badge tone="neutral">
                        {lesson.minReadSeconds} soniya
                      </Badge>
                    </div>
                    {lesson.videoUrl ? (
                      <p className="mt-0.5 max-w-md truncate text-xs text-neutral-500">
                        {lesson.videoUrl}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startLessonEdit(lesson)}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleLessonDelete(lesson)}
                    >
                      O&apos;chirish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-medium text-white">
                {lessonEditingId ? "Darsni tahrirlash" : "Dars qo'shish"}
              </h3>
              <Badge tone="neutral">
                {lessonEditingId
                  ? "Tahrirlanmoqda"
                  : `Keyingi pozitsiya: ${nextLessonPosition}`}
              </Badge>
            </div>

            <form
              onSubmit={handleLessonSubmit}
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <Field label="Sarlavha">
                <Input
                  value={lessonTitle}
                  onChange={(event) => setLessonTitle(event.target.value)}
                  placeholder="Dars sarlavhasi"
                />
              </Field>

              <Field label="Video havolasi" hint="Ixtiyoriy">
                <Input
                  value={lessonVideoUrl}
                  onChange={(event) => setLessonVideoUrl(event.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Pozitsiya">
                <Input
                  type="number"
                  min={1}
                  value={lessonPosition}
                  onChange={(event) => setLessonPosition(event.target.value)}
                />
              </Field>

              <Field label="O'qish vaqti (soniya)">
                <Input
                  type="number"
                  min={0}
                  value={lessonMinRead}
                  onChange={(event) => setLessonMinRead(event.target.value)}
                />
              </Field>

              <Field label="Matn" className="sm:col-span-2">
                <Textarea
                  rows={6}
                  value={lessonContent}
                  onChange={(event) => setLessonContent(event.target.value)}
                  placeholder="Dars matni (markdown)"
                />
              </Field>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" disabled={!lessonCanSave}>
                  {savingLesson ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetLessonDraft(lessons.length)}
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
