"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { registerUser, verifyEmail } from "@/lib/api";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await registerUser({
        email,
        password,
        fullName,
        phone: phone.trim() ? phone.trim() : undefined,
      });
      setMessage(data.message);
      setDevOtp(data.devOtp ?? null);
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await verifyEmail(email, otp);
      setMessage(data.message);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-6">
      {step === "form" ? (
        <Card glow className="fade-up p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 font-bold text-neutral-950">
              U
            </span>
            <div>
              <h1 className="text-xl font-semibold text-white">Ro&apos;yxatdan o&apos;tish</h1>
              <p className="text-sm text-neutral-400">
                Pilot kabinetiga qo&apos;shilish uchun ma&apos;lumotlaringizni kiriting.
              </p>
            </div>
          </div>

          <form onSubmit={onRegister} className="mt-6 flex flex-col gap-4">
            <Field label="To'liq ism">
              <Input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ism Familiya"
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="pilot@uzdf.pro"
              />
            </Field>

            <Field label="Parol" hint="Kamida 8 ta belgi">
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Field label="Telefon (majburiy emas)">
              <Input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </Field>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-sky-400 hover:text-sky-300">
              Kirish
            </Link>
          </p>
        </Card>
      ) : null}

      {step === "otp" ? (
        <Card glow className="fade-up p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 font-bold text-neutral-950">
              U
            </span>
            <div>
              <h1 className="text-xl font-semibold text-white">Emailni tasdiqlash</h1>
              <p className="text-sm text-neutral-400">
                {email} manziliga yuborilgan 6 xonali kodni kiriting.
              </p>
            </div>
          </div>

          {message ? (
            <Alert tone="info" className="mt-6">
              {message}
            </Alert>
          ) : null}

          {devOtp ? (
            <Alert tone="info" className="mt-3 border-dashed">
              <div className="flex items-center justify-between gap-3">
                <span>Dev rejim kodi</span>
                <code className="rounded-lg bg-neutral-950/50 px-2.5 py-1 font-mono text-base font-semibold tracking-[0.3em]">
                  {devOtp}
                </code>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setOtp(devOtp)}
              >
                Kodni avtomatik to&apos;ldirish
              </Button>
            </Alert>
          ) : null}

          <form onSubmit={onVerify} className="mt-6 flex flex-col gap-4">
            <Field label="Tasdiqlash kodi">
              <Input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-lg tracking-[0.5em]"
              />
            </Field>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <Button
              type="submit"
              size="lg"
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </Button>
          </form>
        </Card>
      ) : null}

      {step === "done" ? (
        <Card glow className="fade-up p-6 text-center sm:p-8">
          <h1 className="text-2xl font-semibold text-white">Email tasdiqlandi</h1>
          {message ? (
            <Alert tone="success" className="mt-4 text-left">
              {message}
            </Alert>
          ) : null}
          <Link
            href="/login"
            className={buttonClasses({ size: "lg", className: "mt-6 w-full" })}
          >
            Endi kirish
          </Link>
        </Card>
      ) : null}
    </main>
  );
}
