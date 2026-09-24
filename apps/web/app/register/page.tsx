"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { registerUser, verifyEmail } from "@/lib/api";

type Step = "form" | "otp" | "done";

/* ---------------------------------- Ikonka ---------------------------------- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-3.5 w-3.5"}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/* ------------------------------- Chap ustun ------------------------------- */

const highlights = [
  { title: "Akademiya", text: "Online o'quv dasturi va amaliy kurslar" },
  { title: "Poligonlar", text: "Respublika bo'ylab uchish maydonlari" },
  { title: "Sertifikat", text: "Xalqaro standartlarga mos hujjat" },
];

function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:min-h-[40rem] lg:flex-col">
      <Image
        src="/images/news-simulator.png"
        alt="Milliy simulyator"
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a17]/95 via-[#050a17]/75 to-[#050a17]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-transparent to-[#050a17]/50" />

      <div className="relative flex h-full w-full flex-col justify-between gap-10 p-10 xl:p-14">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-base font-bold text-[#04121f]">
            D
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            DRON<span className="text-emerald-400">CHI</span>
          </span>
        </Link>

        <div className="flex max-w-md flex-col items-start gap-6">
          <Badge tone="emerald">O&apos;zbekistondagi yagona ekotizim</Badge>
          <h2 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-5xl">
            Dronlardan <span className="gradient-text">aviatsiyaga</span> yagona yo&apos;l
          </h2>
          <p className="text-sm leading-relaxed text-neutral-300">
            Bir akkaunt bilan nazariyadan birinchi parvozgacha: ta&apos;lim, poligonlar,
            simulyator va sertifikat.
          </p>

          <ul className="flex w-full flex-col gap-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-[#04121f]">
                  <CheckIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-neutral-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="font-display text-2xl font-extrabold gradient-text">35+</p>
            <p className="text-xs text-neutral-400">maktab va universitet</p>
          </div>
          <span className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-display text-2xl font-extrabold gradient-text">4000+</p>
            <p className="text-xs text-neutral-400">o&apos;qitilgan yosh</p>
          </div>
          <span className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-display text-2xl font-extrabold gradient-text">4</p>
            <p className="text-xs text-neutral-400">poligon hududi</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------- Sahifa ---------------------------------- */

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
    <main className="flex w-full flex-1 flex-col lg:grid lg:grid-cols-2">
      <AuthAside />

      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <div className="w-full max-w-md">
          {step === "form" ? (
            <div className="glass gradient-border ring-glow fade-up rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-lg font-bold text-[#04121f]">
                  D
                </span>
                <div>
                  <h1 className="font-display text-xl font-bold text-white">
                    Ro&apos;yxatdan o&apos;tish
                  </h1>
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
                <Link
                  href="/login"
                  className="font-medium text-emerald-400 transition hover:text-emerald-300"
                >
                  Kirish
                </Link>
              </p>
            </div>
          ) : null}

          {step === "otp" ? (
            <div className="glass gradient-border ring-glow fade-up rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-display text-lg font-bold text-[#04121f]">
                  D
                </span>
                <div>
                  <h1 className="font-display text-xl font-bold text-white">
                    Emailni tasdiqlash
                  </h1>
                  <p className="text-sm text-neutral-400">
                    {email} manziliga yuborilgan 6 xonali kodni kiriting.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Badge tone="sky">Tasdiqlash</Badge>
                <span className="text-xs text-neutral-500">3 qadamdan 2-si</span>
              </div>

              {message ? (
                <Alert tone="info" className="mt-4">
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
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="text-center font-mono text-2xl tracking-[0.5em]"
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
            </div>
          ) : null}

          {step === "done" ? (
            <div className="glass gradient-border ring-glow fade-up rounded-3xl p-6 text-center sm:p-8">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[#04121f]">
                <CheckIcon className="h-7 w-7" />
              </span>
              <h1 className="mt-5 font-display text-2xl font-bold text-white">
                Email tasdiqlandi
              </h1>
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
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
