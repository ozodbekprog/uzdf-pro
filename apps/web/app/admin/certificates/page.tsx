"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { cn } from "@/lib/cn";
import {
  deleteAdminCertificate,
  getAdminCertificates,
  type AdminCertificate,
} from "@/lib/admin-api";

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const CODE_LINK =
  "font-mono text-sm font-semibold text-emerald-300 underline-offset-4 transition hover:text-emerald-200 hover:underline";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("uz-UZ");
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCertificates();
      setCertificates(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return certificates;
    return certificates.filter((certificate) => {
      return (
        certificate.user.fullName.toLowerCase().includes(term) ||
        certificate.user.email.toLowerCase().includes(term) ||
        certificate.code.toLowerCase().includes(term)
      );
    });
  }, [certificates, debouncedQuery]);

  const uniqueCourses = useMemo(() => {
    return new Set(certificates.map((certificate) => certificate.course.slug)).size;
  }, [certificates]);

  async function handleDelete(certificate: AdminCertificate) {
    const confirmed = window.confirm(
      `"${certificate.code}" sertifikatini bekor qilishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.`
    );
    if (!confirmed) return;

    setDeletingId(certificate.id);
    setError(null);
    try {
      await deleteAdminCertificate(certificate.id);
      setCertificates((prev) => prev.filter((item) => item.id !== certificate.id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Sertifikatlar"
        subtitle="Berilgan sertifikatlarni ko'rish, qidirish va bekor qilish"
        actions={
          <>
            <Badge tone="emerald">Jami: {certificates.length} ta</Badge>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={load}
              disabled={loading}
            >
              Yangilash
            </Button>
          </>
        }
      />

      <section className="fade-up mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Jami"
          value={certificates.length}
          accent="emerald"
          hint="Barcha berilgan sertifikatlar"
        />
        <StatCard
          label="Ko'rinayotgan"
          value={filtered.length}
          accent="sky"
          hint="Qidiruv natijasi"
        />
        <StatCard
          label="Kurslar"
          value={uniqueCourses}
          accent="violet"
          hint="Sertifikatlangan kurslar"
        />
      </section>

      <Card className="fade-up mt-6 p-5">
        <Field label="Qidiruv" hint="Foydalanuvchi ismi, emaili yoki sertifikat kodi">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism, email yoki sertifikat kodi bo'yicha qidiring..."
          />
        </Field>
      </Card>

      {error ? (
        <Alert tone="error" className="fade-up mt-6">
          {error}
        </Alert>
      ) : null}

      <Card className="fade-up mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
          <h2 className="font-medium text-white">Sertifikatlar ro&apos;yxati</h2>
          <Badge tone="neutral">{filtered.length} ta</Badge>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="hidden h-5 w-40 sm:block" />
                <Skeleton className="hidden h-8 w-24 sm:block" />
              </div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Hozircha sertifikatlar yo'q"
              description="Tizimda hali birorta sertifikat berilmagan. Sertifikatlar kurslar yakunlangach avtomatik beriladi."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Hech narsa topilmadi"
              description="Qidiruv so'roviga mos sertifikat topilmadi. Boshqa kalit so'z bilan urinib ko'ring."
            />
          </div>
        ) : (
          <>
            {/* Mobil: kartalar */}
            <div className="flex flex-col gap-3 p-4 md:hidden">
              {filtered.map((certificate) => (
                <article
                  key={certificate.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/certificate/${certificate.code}`}
                      target="_blank"
                      rel="noreferrer"
                      className={CODE_LINK}
                    >
                      {certificate.code}
                    </Link>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={deletingId === certificate.id}
                      onClick={() => handleDelete(certificate)}
                    >
                      {deletingId === certificate.id ? "..." : "Bekor qilish"}
                    </Button>
                  </div>
                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-neutral-500">Egasi</dt>
                      <dd className="text-right text-neutral-200">
                        {certificate.user.fullName}
                        <span className="block text-xs text-neutral-500">
                          {certificate.user.email}
                        </span>
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-neutral-500">Kurs</dt>
                      <dd className="text-right text-neutral-200">
                        {certificate.course.title}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-neutral-500">Berilgan sana</dt>
                      <dd className="text-right text-neutral-200">
                        {formatDate(certificate.issuedAt)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            {/* Kattaroq ekran: jadval */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-neutral-500">
                    <th className="px-5 py-3 font-medium">Sertifikat kodi</th>
                    <th className="px-5 py-3 font-medium">Egasi</th>
                    <th className="px-5 py-3 font-medium">Kurs</th>
                    <th className="px-5 py-3 font-medium">Berilgan sana</th>
                    <th className="px-5 py-3 text-right font-medium">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((certificate) => (
                    <tr
                      key={certificate.id}
                      className={cn(
                        "transition",
                        deletingId === certificate.id
                          ? "bg-red-500/5"
                          : "hover:bg-white/[0.02]"
                      )}
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/certificate/${certificate.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className={CODE_LINK}
                        >
                          {certificate.code}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-neutral-100">
                          {certificate.user.fullName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {certificate.user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-neutral-300">
                        {certificate.course.title}
                      </td>
                      <td className="px-5 py-4 text-neutral-400">
                        {formatDate(certificate.issuedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={deletingId === certificate.id}
                          onClick={() => handleDelete(certificate)}
                        >
                          {deletingId === certificate.id ? "..." : "Bekor qilish"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
