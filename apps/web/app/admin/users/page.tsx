"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { getMe } from "@/lib/api";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  type AdminRole,
  type AdminUser,
} from "@/lib/admin-api";

const SHELL = "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10";

const ROLE_OPTIONS: Array<{ value: AdminRole; label: string }> = [
  { value: "PILOT", label: "Uchuvchi" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Administrator" },
  { value: "SUPERADMIN", label: "Superadmin" },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  PILOT: "Uchuvchi",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
  SUPERADMIN: "Superadmin",
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Xatolik";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [meId, setMeId] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [expDrafts, setExpDrafts] = useState<Record<string, string>>({});

  // Joriy adminni aniqlaymiz — o'zini o'chirish tugmasini yashirish uchun.
  useEffect(() => {
    let active = true;
    getMe()
      .then((me) => {
        if (active) setMeId(me.id);
      })
      .catch(() => {
        /* jim o'tkazamiz */
      });
    return () => {
      active = false;
    };
  }, []);

  // Qidiruvni 400ms debounce qilamiz.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Qidiruv yoki rol o'zgarganda ro'yxatni qayta yuklaymiz.
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getAdminUsers({
          search: debouncedSearch || undefined,
          role: role || undefined,
        });
        if (!active) return;
        setUsers(data);
        setError(null);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [debouncedSearch, role]);

  // Muvaffaqiyat xabari 2.5 sekunddan keyin yo'qoladi.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 2500);
    return () => clearTimeout(timer);
  }, [success]);

  function setRowBusy(id: string, value: boolean) {
    setBusy((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: true };
    });
  }

  function replaceUser(updated: AdminUser) {
    // PATCH javobida `counts` bo'lmasligi mumkin — mavjud qiymatlarni saqlab qolamiz.
    setUsers((prev) =>
      prev.map((user) => (user.id === updated.id ? { ...user, ...updated } : user))
    );
  }

  async function handleRoleChange(user: AdminUser, next: AdminRole) {
    if (next === user.role) return;
    setError(null);
    setSuccess(null);
    setRowBusy(user.id, true);
    try {
      const updated = await updateAdminUser(user.id, { role: next });
      replaceUser(updated);
      setSuccess(`${updated.fullName} roli "${ROLE_LABEL[next]}" ga o'zgartirildi.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(user.id, false);
    }
  }

  async function handleExpSave(user: AdminUser) {
    const raw = expDrafts[user.id] ?? String(user.exp);
    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("EXP musbat son bo'lishi kerak.");
      return;
    }

    const exp = Math.floor(parsed);
    if (exp === user.exp) return;

    setError(null);
    setSuccess(null);
    setRowBusy(user.id, true);
    try {
      const updated = await updateAdminUser(user.id, { exp });
      replaceUser(updated);
      setExpDrafts((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
      setSuccess(`${updated.fullName} uchun EXP ${exp} ga yangilandi.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(user.id, false);
    }
  }

  async function handleEmailToggle(user: AdminUser) {
    setError(null);
    setSuccess(null);
    setRowBusy(user.id, true);
    try {
      const updated = await updateAdminUser(user.id, {
        emailVerified: !user.emailVerified,
      });
      replaceUser(updated);
      setSuccess(
        `${updated.fullName} email holati "${
          updated.emailVerified ? "tasdiqlangan" : "tasdiqlanmagan"
        }" ga o'zgartirildi.`
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(user.id, false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (
      !window.confirm(`"${user.fullName}" foydalanuvchisini o'chirishni tasdiqlaysizmi?`)
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    setRowBusy(user.id, true);
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setSuccess(`${user.fullName} o'chirildi.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(user.id, false);
    }
  }

  function renderRoleSelect(user: AdminUser, className?: string) {
    return (
      <Select
        aria-label={`${user.fullName} roli`}
        value={user.role}
        disabled={busy[user.id]}
        onChange={(event) => handleRoleChange(user, event.target.value as AdminRole)}
        className={cn("w-36 py-1.5 text-xs", className)}
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  function renderEmailBadge(user: AdminUser) {
    return (
      <button
        type="button"
        disabled={busy[user.id]}
        onClick={() => handleEmailToggle(user)}
        title="Email tasdiqlash holatini o'zgartirish"
        className="transition disabled:opacity-50"
      >
        <Badge tone={user.emailVerified ? "emerald" : "neutral"}>
          {user.emailVerified ? "Ha" : "Yo'q"}
        </Badge>
      </button>
    );
  }

  function renderExp(user: AdminUser, className?: string) {
    const draft = expDrafts[user.id] ?? String(user.exp);
    const unchanged = draft === String(user.exp);

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          type="number"
          min={0}
          aria-label={`${user.fullName} EXP`}
          value={draft}
          disabled={busy[user.id]}
          onChange={(event) =>
            setExpDrafts((prev) => ({ ...prev, [user.id]: event.target.value }))
          }
          className="w-20 px-2 py-1.5 text-xs"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy[user.id] || unchanged}
          onClick={() => handleExpSave(user)}
        >
          Saqlash
        </Button>
      </div>
    );
  }

  function renderActivity(user: AdminUser) {
    const counts = user.counts;
    const violations = counts?.violations ?? 0;

    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-neutral-300">
          {counts?.lessons ?? 0} dars
        </span>
        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-neutral-300">
          {counts?.attempts ?? 0} test
        </span>
        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-neutral-300">
          {counts?.orders ?? 0} buyurtma
        </span>
        <span
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[11px]",
            violations > 0
              ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-white/10 bg-white/5 text-neutral-300"
          )}
        >
          {violations} qoidabuzarlik
        </span>
      </div>
    );
  }

  function renderActions(user: AdminUser) {
    if (user.id === meId) {
      return <Badge tone="sky">Siz</Badge>;
    }

    return (
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={busy[user.id]}
        onClick={() => handleDelete(user)}
      >
        O&apos;chirish
      </Button>
    );
  }

  return (
    <main className={SHELL}>
      <PageHeader
        className="fade-up"
        title="Foydalanuvchilar"
        subtitle="Foydalanuvchilar ro'yxati, rollari va faolligini boshqaring."
        actions={
          <Badge tone="neutral">{users.length} ta foydalanuvchi</Badge>
        }
      />

      <Card className="fade-up mt-6 grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <Field label="Qidiruv">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ism yoki email bo'yicha qidirish"
          />
        </Field>
        <Field label="Rol">
          <Select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole | "")}
          >
            <option value="">Barchasi</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <div className="mt-6 flex flex-col gap-4">
        {success ? <Alert tone="success">{success}</Alert> : null}
        {error ? <Alert tone="error">{error}</Alert> : null}

        {loading ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-56" />
                  </div>
                  <Skeleton className="hidden h-8 w-32 md:block" />
                  <Skeleton className="hidden h-8 w-24 md:block" />
                </div>
              ))}
            </div>
          </Card>
        ) : users.length === 0 ? (
          error ? null : (
            <EmptyState
              title="Foydalanuvchilar topilmadi"
              description="Qidiruv yoki rol filtrini o'zgartirib ko'ring."
            />
          )
        ) : (
          <>
            {/* Katta ekranlar uchun jadval */}
            <Card className="fade-up hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Foydalanuvchi</th>
                      <th className="px-4 py-3 font-medium">Rol</th>
                      <th className="px-4 py-3 font-medium">EXP</th>
                      <th className="px-4 py-3 font-medium">Faollik</th>
                      <th className="px-4 py-3 font-medium">Ro&apos;yxatdan o&apos;tgan</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 text-right font-medium">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className={cn(
                          "transition",
                          busy[user.id] ? "opacity-60" : "hover:bg-white/[0.02]"
                        )}
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{user.fullName}</span>
                            <span className="text-xs text-neutral-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">{renderRoleSelect(user)}</td>
                        <td className="px-4 py-4">{renderExp(user)}</td>
                        <td className="px-4 py-4">{renderActivity(user)}</td>
                        <td className="px-4 py-4 text-neutral-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-4">{renderEmailBadge(user)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end">{renderActions(user)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobilda karta ko'rinishida */}
            <div className="fade-up flex flex-col gap-3 md:hidden">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.fullName}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{user.email}</p>
                    </div>
                    {renderEmailBadge(user)}
                  </div>

                  <dl className="mt-4 flex flex-col gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <dt className="text-neutral-500">Rol</dt>
                      <dd>{renderRoleSelect(user, "w-full")}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-neutral-500">EXP</dt>
                      <dd>{renderExp(user)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-neutral-500">Faollik</dt>
                      <dd>{renderActivity(user)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-neutral-500">Ro&apos;yxatdan o&apos;tgan</dt>
                      <dd className="text-neutral-300">{formatDate(user.createdAt)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex justify-end">{renderActions(user)}</div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
