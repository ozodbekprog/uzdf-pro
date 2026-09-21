"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-6">
      <Card glow className="fade-up p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 font-bold text-neutral-950">
            U
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Tizimga kirish</h1>
            <p className="text-sm text-neutral-400">
              Pilot kabineti: profil, EXP va o&apos;quv progressi.
            </p>
          </div>
        </div>

        <Alert tone="info" className="mt-6">
          <span className="font-semibold">Demo:</span> pilot@uzdf.pro / Pilot123!
        </Alert>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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

          <Field label="Parol">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="text-sky-400 hover:text-sky-300">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </Card>

      <p className="text-center text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-300">
          Bosh sahifaga qaytish
        </Link>
      </p>
    </main>
  );
}
