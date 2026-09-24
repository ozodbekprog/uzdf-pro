"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getCourses, type CourseSummary } from "@/lib/api";

export default function AcademyPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCourses()
      .then((data) => {
        if (active) setCourses(data);
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

  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);
  // Har bir dars uchun test mavjud — shuning uchun testlar soni darslar soniga teng.
  const totalQuizzes = totalLessons;

  const stats = [
    { label: "Kurslar", value: courses.length, hint: "Mavjud yo'nalishlar" },
    { label: "Darslar", value: totalLessons, hint: "Video va matnli" },
    { label: "Testlar", value: totalQuizzes, hint: "Bilimni sinash" },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-10">
        {/* ------------------------------ HERO ------------------------------ */}
        <section className="flex flex-col gap-7">
          <div className="rise rise-1 flex flex-col gap-4">
            <Badge tone="emerald">O&apos;quv dasturi</Badge>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Onlayn <span className="gradient-text">Akademiya</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
              Video va matnli darslar — har bir yakunlangan dars uchun EXP. Nazariyadan
              amaliyotga bosqichma-bosqich yo&apos;l.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Bosh sahifa
              </Link>
              <span className="text-sm text-neutral-500">
                {loading
                  ? "Ma\u2019lumotlar yuklanmoqda..."
                  : `${courses.length} ta kurs mavjud`}
              </span>
            </div>
          </div>

          <div className="glass mesh-card rise rise-2 grid divide-y divide-white/[0.06] overflow-hidden rounded-3xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 px-6 py-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                  {stat.label}
                </span>
                {loading ? (
                  <Skeleton className="mt-1 h-9 w-16" />
                ) : (
                  <span className="font-display text-4xl font-extrabold tracking-tight gradient-text">
                    {stat.value}
                  </span>
                )}
                <span className="text-xs text-neutral-500">{stat.hint}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------ KURSLAR ------------------------------ */}
        {loading ? (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Card key={item} className={`rise rise-${item + 1} flex flex-col overflow-hidden`}>
                <div aria-hidden="true" className="skeleton h-44 w-full" />
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="mt-2 h-8 w-32" />
                </div>
              </Card>
            ))}
          </section>
        ) : error ? (
          <Alert tone="error" className="rise rise-1">
            {error}
          </Alert>
        ) : courses.length === 0 ? (
          <div className="rise rise-1">
            <EmptyState
              title="Hozircha kurslar mavjud emas."
              description="Yangi darslar tez orada qo'shiladi."
              actionLabel="Bosh sahifa"
              actionHref="/"
            />
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <Card
                key={course.id}
                hover
                className={`rise rise-${(index % 3) + 1} group flex flex-col overflow-hidden`}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={course.coverUrl ?? "/images/course-fpv.png"}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
                  <span className="absolute right-3 top-3">
                    <Badge tone="sky">{course.lessonsCount} ta dars</Badge>
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="font-display text-lg font-bold tracking-tight text-white">
                    {course.title}
                  </h2>
                  {course.description ? (
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-400">
                      {course.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Link
                    href={`/academy/${course.slug}`}
                    className={buttonClasses({
                      variant: "secondary",
                      size: "sm",
                      className: "self-start",
                    })}
                  >
                    Kursni ochish
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
