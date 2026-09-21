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
import Skeleton from "@/components/ui/Skeleton";
import {
  clearTokens,
  getMyCertificates,
  getTokens,
  type CertificateItem,
} from "@/lib/api";

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getTokens()) {
      router.replace("/login");
      return;
    }

    let active = true;

    getMyCertificates()
      .then((data) => {
        if (active) setCertificates(data);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        if (/401|unauthorized|token/i.test(err.message)) {
          clearTokens();
          router.replace("/login");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <AppShell>
      <main className="fade-up mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8">
          <PageHeader
            title="Sertifikatlar"
            subtitle="Yakunlangan kurslar uchun berilgan sertifikatlar."
          />

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <Card key={item} className="flex flex-col gap-4 p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : certificates.length === 0 ? (
            <EmptyState
              title="Hali sertifikat yo'q"
              description="Kurslarni to'liq yakunlab, sertifikat oling."
              actionLabel="Akademiyaga o'tish"
              actionHref="/academy"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  hover
                  className="flex flex-col gap-3 p-6"
                >
                  <Badge tone="violet" className="self-start">
                    Sertifikat
                  </Badge>
                  <h2 className="text-lg font-semibold text-white">
                    {certificate.course.title}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Berilgan sana:{" "}
                    {new Date(certificate.issuedAt).toLocaleDateString("uz-UZ")}
                  </p>
                  <p className="font-mono text-xs text-neutral-400">
                    {certificate.code}
                  </p>
                  <Link
                    href={`/certificate/${certificate.code}`}
                    className={buttonClasses({
                      variant: "secondary",
                      size: "sm",
                      className: "mt-1 self-start",
                    })}
                  >
                    Ko&apos;rish
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
