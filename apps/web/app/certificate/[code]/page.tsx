"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState, useSyncExternalStore } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { verifyCertificate, type CertificateVerify } from "@/lib/api";

export default function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return <CertificateView key={code} code={code} />;
}

function CertificateView({ code }: { code: string }) {
  const [data, setData] = useState<CertificateVerify | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );

  useEffect(() => {
    let active = true;

    verifyCertificate(code)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code]);

  return (
    <main className="fade-up flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6 sm:py-14 print:py-0">
      {loading ? (
        <Card className="w-full max-w-2xl p-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-9 w-2/3" />
          <Skeleton className="mt-4 h-4 w-1/3" />
          <Skeleton className="mt-2 h-7 w-1/2" />
          <Skeleton className="mt-8 h-24 w-full" />
        </Card>
      ) : error || !data ? (
        <div className="fade-up flex w-full max-w-md flex-col items-center gap-4">
          <Alert tone="error" className="w-full">
            Sertifikat topilmadi yoki kod xato
          </Alert>
          <Link
            href="/"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            Bosh sahifa
          </Link>
        </div>
      ) : (
        <>
          <div className="fade-up w-full max-w-3xl rounded-3xl bg-gradient-to-br from-sky-400 via-violet-400 to-cyan-300 p-[1px]">
            <div className="rounded-[calc(1.5rem-1px)] bg-neutral-950 p-8">
              <Badge tone="sky">UZDF Pro · Sertifikat</Badge>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {data.user.fullName}
              </h1>
              <p className="mt-4 text-sm text-neutral-400">
                quyidagi kursni muvaffaqiyatli tamomladi:
              </p>
              <h2 className="mt-1 text-xl font-semibold text-sky-300 sm:text-2xl">
                {data.course.title}
              </h2>

              <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-neutral-400">
                    Berilgan sana:{" "}
                    {new Date(data.issuedAt).toLocaleDateString("uz-UZ")}
                  </span>
                  <span className="font-mono text-xs text-neutral-500">
                    {data.code}
                  </span>
                </div>

                {origin ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        `${origin}/certificate/${code}`
                      )}`}
                      alt="Sertifikatni tekshirish QR kodi"
                      width={140}
                      height={140}
                      unoptimized
                      className="rounded-lg bg-white p-1"
                    />
                    <p className="max-w-[190px] text-center text-[11px] leading-snug text-neutral-500">
                      Sertifikatni tekshirish uchun QR kodni skanerlang
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="fade-up flex flex-wrap items-center justify-center gap-3 print:hidden">
            <Button type="button" onClick={() => window.print()}>
              Chop etish
            </Button>
            <Link
              href="/"
              className={buttonClasses({ variant: "secondary" })}
            >
              Bosh sahifa
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
