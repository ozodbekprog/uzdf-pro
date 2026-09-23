"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { cn } from "@/lib/cn";
import {
  createZone,
  deleteZone,
  getManagedZones,
  getZoneStats,
  updateZone,
  type Zone,
  type ZoneInput,
  type ZoneStats,
  type ZoneType,
} from "@/lib/api";

const ZoneEditor = dynamic(() => import("@/components/ZoneEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      Xarita yuklanmoqda...
    </div>
  ),
});

const TYPE_TONES: Record<ZoneType, BadgeTone> = {
  RED: "red",
  YELLOW: "amber",
  GREEN: "emerald",
};

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [stats, setStats] = useState<ZoneStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<ZoneType>("YELLOW");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [points, setPoints] = useState<[number, number][]>([]);

  const refresh = useCallback(async () => {
    const [nextZones, nextStats] = await Promise.all([
      getManagedZones(),
      getZoneStats(),
    ]);
    setZones(nextZones);
    setStats(nextStats);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nextZones, nextStats] = await Promise.all([
          getManagedZones(),
          getZoneStats(),
        ]);
        if (cancelled) return;
        setZones(nextZones);
        setStats(nextStats);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetDraft = useCallback(() => {
    setEditingId(null);
    setName("");
    setType("YELLOW");
    setDescription("");
    setActive(true);
    setPoints([]);
  }, []);

  const addPoint = useCallback((point: [number, number]) => {
    setPoints((prev) => [...prev, point]);
  }, []);

  function startEdit(zone: Zone) {
    setEditingId(zone.id);
    setName(zone.name);
    setType(zone.type);
    setDescription(zone.description ?? "");
    setActive(zone.active);
    setPoints(zone.polygon);
    setError(null);
    setSuccess(null);
  }

  function handleRefresh() {
    setError(null);
    setSuccess(null);
    refresh().catch((err: Error) => setError(err.message));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const canSave = name.trim().length > 0 && points.length >= 3 && !saving;
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const input: ZoneInput = {
      name: name.trim(),
      type,
      description: description.trim() ? description.trim() : undefined,
      polygon: points,
      active,
    };

    try {
      if (editingId) {
        await updateZone(editingId, input);
        setSuccess("Zona yangilandi.");
      } else {
        await createZone(input);
        setSuccess("Yangi zona qo'shildi.");
      }
      resetDraft();
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(zone: Zone) {
    if (!window.confirm(`"${zone.name}" zonasini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await deleteZone(zone.id);
      if (editingId === zone.id) resetDraft();
      await refresh();
      setSuccess("Zona o'chirildi.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className={SHELL}>
        <Card className="fade-up mx-auto max-w-2xl p-6" glow>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <p className="mt-6 text-center text-sm text-neutral-400">
            Tekshirilmoqda...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Geozonalar"
        subtitle="RED — taqiqlangan, YELLOW — cheklangan, GREEN — erkin"
        actions={
          <>
            <Link
              href="/zones"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Zonalar xaritasi
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              Yangilash
            </Button>
          </>
        }
      />

      <section className="fade-up mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami" value={stats?.total ?? 0} hint="Barcha zonalar" />
        <StatCard
          label="Faol"
          value={stats?.active ?? 0}
          accent="emerald"
          hint="Faol zonalar"
        />
        <StatCard
          label="RED"
          value={stats?.byType.RED ?? 0}
          accent="red"
          hint="Qizil zona"
        />
        <StatCard
          label="YELLOW + GREEN"
          value={(stats?.byType.YELLOW ?? 0) + (stats?.byType.GREEN ?? 0)}
          accent="amber"
          hint={`YELLOW ${stats?.byType.YELLOW ?? 0} · GREEN ${stats?.byType.GREEN ?? 0}`}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="fade-up overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
            <h2 className="font-medium text-white">Xarita muharriri</h2>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">Nuqtalar: {points.length}</Badge>
              {editingId ? <Badge tone="sky">Tahrirlanmoqda</Badge> : null}
            </div>
          </div>
          <div className="h-[70vh] min-h-[420px]">
            <ZoneEditor
              zones={zones}
              points={points}
              onAddPoint={addPoint}
              activeType={type}
              editingId={editingId}
            />
          </div>
        </Card>

        <Card className="fade-up h-fit p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Zonani tahrirlash" : "Yangi zona"}
            </h2>
            {editingId ? <Badge tone="sky">Tahrirlanmoqda</Badge> : null}
          </div>

          {error ? (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          ) : null}

          {success ? (
            <Alert tone="success" className="mt-4">
              {success}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <Field label="Nomi">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Masalan: Toshkent markaziy zonasi"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Turi">
                <Select
                  value={type}
                  onChange={(event) => setType(event.target.value as ZoneType)}
                >
                  <option value="RED">RED</option>
                  <option value="YELLOW">YELLOW</option>
                  <option value="GREEN">GREEN</option>
                </Select>
              </Field>

              <label className="flex cursor-pointer items-center gap-2 self-end rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm transition hover:border-sky-400/40">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 accent-sky-500"
                />
                <span className="font-medium text-neutral-300">Faol</span>
              </label>
            </div>

            <Field label="Tavsif">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </Field>

            <p className="text-xs text-neutral-500">
              Xaritaga bosib nuqta qo&apos;shing (kamida 3 ta). Nuqtalar:{" "}
              {points.length}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                disabled={
                  name.trim().length === 0 || points.length < 3 || saving
                }
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Bekor qilish
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPoints((prev) => prev.slice(0, -1))}
                disabled={points.length === 0}
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                Oxirgi nuqtani o&apos;chirish
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPoints([])}
                disabled={points.length === 0}
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                Tozalash
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="fade-up mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
          <h2 className="font-medium text-white">Zonalar ro&apos;yxati</h2>
          <Badge tone="neutral">{zones.length} ta</Badge>
        </div>

        {zones.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Zonalar topilmadi"
              description="Hozircha hech qanday zona yo'q. Yangi zona qo'shish uchun yuqoridagi formadan foydalaning."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition",
                  editingId === zone.id ? "bg-sky-500/5" : "hover:bg-white/[0.02]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-neutral-100">
                      {zone.name}
                    </p>
                    <Badge tone={TYPE_TONES[zone.type]}>{zone.type}</Badge>
                    <Badge tone={zone.active ? "emerald" : "neutral"}>
                      {zone.active ? "Faol" : "Nofaol"}
                    </Badge>
                  </div>
                  {zone.description ? (
                    <p className="mt-0.5 max-w-md truncate text-xs text-neutral-500">
                      {zone.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {zone.polygon.length} nuqta
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(zone)}
                  >
                    Tahrirlash
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(zone)}
                  >
                    O&apos;chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
