import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { Tilt } from "@/components/ui/Tilt";

const stats: Array<{
  label: string;
  value: string;
  hint: string;
  accent: "sky" | "emerald" | "amber" | "violet" | "red";
}> = [
  {
    label: "Akademiya",
    value: "3+ kurs",
    hint: "Video va matnli darslar",
    accent: "sky",
  },
  {
    label: "Geozonalar",
    value: "3 tur",
    hint: "RED, YELLOW va GREEN",
    accent: "amber",
  },
  {
    label: "Progress",
    value: "EXP",
    hint: "Darajalar va yutuqlar",
    accent: "violet",
  },
  {
    label: "Rollar",
    value: "4 daraja",
    hint: "PILOT dan SUPERADMIN gacha",
    accent: "emerald",
  },
];

const features = [
  {
    title: "Geozonalar",
    description:
      "RED, YELLOW va GREEN zonalar interaktiv xaritada. Parvoz nuqtasi qaysi zonada ekanini bir bosishda tekshiring.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4Z" />
        <path d="M9 4v14M15 6.5v14" />
      </svg>
    ),
  },
  {
    title: "Video akademiya",
    description:
      "Video va matnli darslar, taymer nazorati va kurslar bo'yicha ketma-ket o'quv yo'li.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M10.2 8.6 15.8 12l-5.6 3.4V8.6Z" />
      </svg>
    ),
  },
  {
    title: "EXP va darajalar",
    description:
      "Har bir yakunlangan dars uchun EXP oling, darajani oshiring va yutuqlaringizni kuzatib boring.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 16.5 9.5 11l3.5 3.5L20 7.5" />
        <path d="M14.5 7.5H20V13" />
      </svg>
    ),
  },
  {
    title: "Xavfsizlik va rollar",
    description:
      "PILOT, MODERATOR, ADMIN va SUPERADMIN rollari, JWT va refresh token rotatsiyasi bilan xavfsiz kirish.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 3.5 5 6.2v5.1c0 4.2 2.9 7.1 7 8.7 4.1-1.6 7-4.5 7-8.7V6.2L12 3.5Z" />
        <path d="m9.3 11.9 1.9 1.9 3.6-3.8" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Ro'yxatdan o'ting",
    description:
      "Email orqali hisob yarating, tasdiqlash kodini kiriting va pilot profiliga kiring.",
  },
  {
    number: "02",
    title: "O'qing va mashq qiling",
    description:
      "Akademiya darslarini tugatib, geozonalar bilan ishlashni o'rganing.",
  },
  {
    number: "03",
    title: "Sertifikat va EXP oling",
    description:
      "Har bir dars uchun EXP yig'ing, kursni yakunlab raqamli sertifikat oling.",
  },
];

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="fade-up relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-14rem] h-96 w-[48rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex max-w-3xl flex-col items-start gap-6">
            <Badge tone="sky">
              O&apos;zbekiston BPLA uchuvchilari uchun platforma
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              BPLA uchuvchilari uchun{" "}
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                yagona platforma
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-neutral-400">
              Havo hududi zonalari, o&apos;quv akademiyasi, EXP tizimi va
              rollar boshqaruvi — barchasi bitta ekotizimda. Ochiq API va
              xavfsiz autentifikatsiya asosida.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/academy" className={buttonClasses({ size: "lg" })}>
                Akademiyani boshlash
              </Link>
              <Link
                href="/zones"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Zonalar xaritasi
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-neutral-400 underline-offset-4 transition hover:text-white hover:underline"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="fade-up relative z-10 mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Tilt key={stat.label}>
              <StatCard
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                accent={stat.accent}
                className="h-full bg-neutral-950/80 backdrop-blur-xl"
              />
            </Tilt>
          ))}
        </div>
      </section>

      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="violet">Imkoniyatlar</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Platforma nima beradi
          </h2>
          <p className="max-w-2xl text-neutral-400">
            Uchishdan oldin hududni tekshiring, akademiyada o&apos;qing va
            natijalaringizni kuzatib boring.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Tilt key={feature.title}>
              <Card hover className="flex h-full flex-col gap-4 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-400 shadow-[0_0_20px_-5px_rgba(56,189,248,0.5)] ring-1 ring-sky-400/20">
                  {feature.icon}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Tilt>
          ))}
        </div>
      </section>

      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="emerald">Yo&apos;l xaritasi</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Qanday ishlaydi
          </h2>
          <p className="max-w-2xl text-neutral-400">
            Uch qadamda ro&apos;yxatdan o&apos;tib, birinchi kursni
            yakunlashgacha.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number}>
              <Card className="flex h-full flex-col gap-3 p-6">
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <Card glow className="overflow-hidden p-8 text-center sm:p-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
            <Badge tone="sky">Bepul boshlash</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Birinchi darsni bugun boshlang
            </h2>
            <p className="text-neutral-400">
              Ro&apos;yxatdan o&apos;ting, kursga yoziling va EXP yig&apos;ishni
              hoziroq boshlang.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/academy" className={buttonClasses({ size: "lg" })}>
                Akademiyani boshlash
              </Link>
              <Link
                href="/register"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="mt-24 border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:px-6">
          <span>
            UZDF Pro · BPLA uchuvchilari platformasi ·{" "}
            {new Date().getFullYear()}
          </span>
          <nav className="flex items-center gap-5">
            <Link href="/zones" className="transition hover:text-neutral-300">
              Zonalar
            </Link>
            <Link href="/academy" className="transition hover:text-neutral-300">
              Akademiya
            </Link>
            <Link href="/login" className="transition hover:text-neutral-300">
              Kirish
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
