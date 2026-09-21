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
import PageHeader from "@/components/ui/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton from "@/components/ui/Skeleton";
import {
  clearTokens,
  getDashboard,
  getMyCertificates,
  getTokens,
  type CertificateItem,
  type MyCourse,
} from "@/lib/api";

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getTokens()) {
      router.replace("/login");
      return;
    }

    let active = true;

    Promise.allSettled([getDashboard(), getMyCertificates()]).then(
      ([dashboardResult, certificatesResult]) => {
        if (!active) return;

        if (dashboardResult.status === "fulfilled") {
          setCourses(dashboardResult.value.courses);
        } else {
          const message =
            dashboardResult.reason instanceof Error
              ? dashboardResult.reason.message
              : "Kurslarni yuklab bo'lmadi";
          setError(message);
          if (/401|unauthorized|token/i.test(message)) {
            clearTokens();
            router.replace("/login");
          }
        }

        if (certificatesResult.status === "fulfilled") {
          setCertificates(certificatesResult.value);
        }

        setLoading(false);
      }
    );

    return () => {
      active = false;
    };
  }, [router]);

  const certificatesBySlug = new Map(
    certificates.map((certificate) => [certificate.course.slug, certificate])
  );

  return (
    <AppShell>
      <main className="fade-up mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8">
          <PageHeader
            title="Mening kurslarim"
            subtitle="Kurslar progressi, keyingi darslar va yutuqlar."
          />

          {loading ? (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((item) => (
                <Card key={item} className="flex flex-col gap-4 p-6">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-8 w-32" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : courses.length === 0 ? (
            <EmptyState
              title="Hali kurslar yo'q"
              description="Akademiyadan kurs tanlab, o'qishni boshlang."
              actionLabel="Akademiyaga o'tish"
              actionHref="/academy"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {courses.map((course) => {
                const done = course.percent >= 100;
                const certificate = done
                  ? certificatesBySlug.get(course.slug)
                  : undefined;

                return (
                  <Card
                    key={course.id}
                    hover
                    className="flex flex-col gap-4 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-white">
                            {course.title}
                          </h2>
                          {done ? (
                            <Badge tone="emerald">Yakunlangan</Badge>
                          ) : null}
                          {certificate ? (
                            <Link href={`/certificate/${certificate.code}`}>
                              <Badge tone="violet">Sertifikat</Badge>
                            </Link>
                          ) : null}
                        </div>
                        {course.description ? (
                          <p className="mt-1.5 text-sm text-neutral-400">
                            {course.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {course.completedCount}/{course.lessonsCount} dars
                      </span>
                    </div>

                    <ProgressBar
                      value={course.percent}
                      tone={done ? "emerald" : "sky"}
                      showLabel
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-neutral-500">
                        {course.nextLessonTitle ? (
                          <>
                            Keyingi dars:{" "}
                            <span className="text-neutral-200">
                              {course.nextLessonTitle}
                            </span>
                          </>
                        ) : (
                          "Barcha darslar yakunlangan"
                        )}
                      </p>
                      <Link
                        href={`/academy/${course.slug}`}
                        className={buttonClasses({ size: "sm" })}
                      >
                        {course.percent > 0 ? "Davom etish" : "Boshlash"}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
