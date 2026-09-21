"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, type Zone, type ZoneType } from "@/lib/api";
import Alert from "@/components/ui/Alert";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";

const ZoneMap = dynamic(() => import("@/components/ZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center p-4">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

const STATUS_TONES: Record<string, BadgeTone> = {
  RED: "red",
  YELLOW: "amber",
  GREEN: "emerald",
  CLEAR: "sky",
};

interface CheckResult {
  status: string;
  zones: Array<{ id: string; name: string; type: ZoneType; description?: string | null }>;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ zones: Zone[] }>("/api/v1/zones")
      .then((data) => setZones(data.zones))
      .catch((err: Error) => setError(err.message));
  }, []);

  const check = useCallback(async (picked: { lat: number; lng: number }) => {
    setPoint(picked);
    try {
      const data = await api<CheckResult>("/api/v1/zones/check", {
        method: "POST",
        body: JSON.stringify(picked),
      });
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Havo hududi zonalari"
        subtitle="Xaritaga bosib nuqtani tekshiring — qaysi zonada ekanini ko'rsatadi."
        actions={
          <>
            {result ? (
              <Badge tone={STATUS_TONES[result.status] ?? "sky"}>
                {result.status === "CLEAR" ? "Erkin hudud" : `${result.status} zona`}
              </Badge>
            ) : null}
            <Link href="/" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Bosh sahifa
            </Link>
          </>
        }
      />

      {error ? (
        <Alert tone="error" className="fade-up mt-6">
          {error}
        </Alert>
      ) : null}

      <section className="fade-up mt-6">
        <Card className="overflow-hidden p-1.5">
          <div className="h-[60vh] overflow-hidden rounded-xl">
            <ZoneMap zones={zones} point={point} onPick={check} />
          </div>
        </Card>
      </section>

      <section className="fade-up mt-4">
        {point ? (
          <Card className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-sm">
            <span className="text-neutral-500">Tanlangan nuqta</span>
            <span className="font-mono text-neutral-100">
              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
            </span>
            {result?.zones.length ? (
              <span className="flex flex-wrap items-center gap-2">
                {result.zones.map((zone) => (
                  <Badge key={zone.id} tone="sky">
                    {zone.name} ({zone.type})
                  </Badge>
                ))}
              </span>
            ) : (
              <span className="text-neutral-500">hech qaysi zonada emas</span>
            )}
          </Card>
        ) : (
          <p className="text-sm text-neutral-500">
            Xaritadan nuqta tanlang — natija shu yerda ko&apos;rinadi.
          </p>
        )}
      </section>

      <section className="fade-up mt-6 grid gap-3 sm:grid-cols-3">
        {(["RED", "YELLOW", "GREEN"] as const).map((type) => (
          <StatCard
            key={type}
            label={`${type} zona`}
            value={`${zones.filter((zone) => zone.type === type).length} ta`}
            hint="faol zona"
            accent={type === "RED" ? "red" : type === "YELLOW" ? "amber" : "emerald"}
          />
        ))}
      </section>
    </main>
  );
}
