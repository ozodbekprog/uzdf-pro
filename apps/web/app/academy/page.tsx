"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-8">
        <PageHeader
          className="fade-up"
          title={"O'quv akademiyasi"}
          subtitle="Video va matnli darslar — har bir yakunlangan dars uchun EXP."
          actions={
            <Link
              href="/"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Bosh sahifa
            </Link>
          }
        />

        {loading ? (
          <section className="fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="flex flex-col gap-4 p-6">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="mt-2 h-8 w-32" />
              </Card>
            ))}
          </section>
        ) : error ? (
          <Alert tone="error" className="fade-up">
            {error}
          </Alert>
        ) : courses.length === 0 ? (
          <div className="fade-up">
            <EmptyState
              title="Hozircha kurslar mavjud emas."
              description="Yangi darslar tez orada qo'shiladi."
              actionLabel="Bosh sahifa"
              actionHref="/"
            />
          </div>
        ) : (
          <section className="fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                hover
                className="flex flex-col gap-3 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">{course.title}</h2>
                  <Badge tone="sky">{course.lessonsCount} ta dars</Badge>
                </div>
                {course.description ? (
                  <p className="flex-1 text-sm text-neutral-400">{course.description}</p>
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
              </Card>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
