import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { Tilt } from "@/components/ui/Tilt";

/* ------------------------------------------------------------------ ikonkalar */

const icons = {
  book: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5v-15Zm16 0A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5v-15Z" />
  ),
  sim: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4Z" />
      <path d="M9 4v14M15 6.5v14" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16h8.3a2 2 0 0 0 1.95-1.55L21 8H6" />
    </>
  ),
  news: (
    <>
      <path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2V4Z" />
      <path d="M18 8h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1M8 8h7M8 12h7M8 16h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6.2v5.1c0 4.2 2.9 7.1 7 8.7 4.1-1.6 7-4.5 7-8.7V6.2L12 3.5Z" />
      <path d="m9.3 11.9 1.9 1.9 3.6-3.8" />
    </>
  ),
  drone: (
    <>
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
      <path d="M9 9 5 5M15 9l4-4M9 15l-4 4M15 15l4 4" />
      <circle cx="4" cy="4" r="2.2" />
      <circle cx="20" cy="4" r="2.2" />
      <circle cx="4" cy="20" r="2.2" />
      <circle cx="20" cy="20" r="2.2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 11.2a3 3 0 1 0 0-6M17.5 20a5.6 5.6 0 0 0-2-4.3" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4.5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M9.5 20h5M12 13.5V20" />
    </>
  ),
  building: (
    <>
      <path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20" />
      <path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V20M3 20h18M8 8h4M8 12h4M8 16h4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  warn: (
    <>
      <path d="M12 4.5 3.5 19.5h17L12 4.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.3 6.3 2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12l1-7Z" />,
} as const;

function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

/* --------------------------------------------------------------------- kontent */

const heroStats: Array<{
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "sky" | "amber" | "violet";
}> = [
  {
    label: "Ta'lim",
    value: "35+ maktab",
    hint: "4 universitet hamkor",
    accent: "emerald",
  },
  {
    label: "Yoshlar",
    value: "4000+",
    hint: "O'qitilgan ishtirokchi",
    accent: "sky",
  },
  {
    label: "Harbiylar",
    value: "1000+",
    hint: "Dron tayyorlov kurslari",
    accent: "amber",
  },
  {
    label: "Musobaqalar",
    value: "20+ medal",
    hint: "10+ davlatda",
    accent: "violet",
  },
];

const about = [
  {
    icon: "building" as const,
    title: "Maktablar va universitetlar",
    lines: ["35+ maktab", "4 universitet", "4000+ yosh"],
  },
  {
    icon: "shield" as const,
    title: "Harbiylar",
    lines: ["1000+ harbiy", "Maxsus tayyorlov", "Amaliy poligonlar"],
  },
  {
    icon: "trophy" as const,
    title: "Xalqaro musobaqalar",
    lines: ["10+ davlat", "20+ medallar", "Xalqaro federatsiyalarga a'zolik"],
  },
];

const problems = [
  {
    step: "Darslik",
    title: "Aniq bir tizimga ega darslik yo'q",
    text: "Bilim manbalari tarqoq, yagona o'quv dasturi mavjud emas.",
  },
  {
    step: "Amaliyot",
    title: "Bilimni sinab ko'rish imkoni yo'q",
    text: "O'rgangan ko'nikmalarni maxsus simulyatorlarda mashq qilib bo'lmaydi.",
  },
  {
    step: "Dron",
    title: "Foydalanish taqiqlangan",
    text: "O'zbekiston Respublikasida drondan foydalanish cheklangan.",
  },
  {
    step: "Poligon",
    title: "Maxsus poligonlar mavjud emas",
    text: "Dron uchirish uchun qonuniy va xavfsiz hududlar yetarli emas.",
  },
  {
    step: "Kelajak",
    title: "Kimga murojaat qilish noaniq",
    text: "Sohada davom etmoqchi bo'lganlar yo'l xaritasini bilmaydi.",
  },
];

const pillars = [
  {
    n: "01",
    icon: "book" as const,
    title: "Online o'quv dasturi",
    text: "3 yillik tajribadan kelib chiqqan holda tuzilgan professional darajadagi o'quv dasturi.",
  },
  {
    n: "02",
    icon: "sim" as const,
    title: "Milliy simulyator",
    text: "Dronlarni virtual tarzda uchirish orqali o'qish va kadr tayyorlash imkoniyati.",
  },
  {
    n: "03",
    icon: "map" as const,
    title: "Poligonlar xaritasi",
    text: "Dronlar uchishi uchun mo'ljallangan maxsus poligonlarning interaktiv xaritasi.",
  },
  {
    n: "04",
    icon: "cart" as const,
    title: "Maxsus dronlar",
    text: "O'quv doirasida tasdiqlangan professional dronlarni sotib olish imkoni.",
  },
  {
    n: "05",
    icon: "news" as const,
    title: "Barcha yangiliklar",
    text: "Shu sohaga va dronlarga oid yangiliklardan doimiy xabardor bo'lish.",
  },
];

const platformPerks = [
  "Yurtimizning istalgan burchagidan masofadan o'qish imkoniyati.",
  "Dron uchirishdan oldin to'liq nazariy mashg'ulot uchun maxsus dastur.",
  "Dronlarni xarid qilish imkoniyati.",
  "Real vaqtda dronlarni uchirib amaliyot olish imkoniyati.",
  "Qo'llanma hamda ichki va jahon yangiliklari bilan doimiy tanishib borish.",
];

const courses = [
  {
    title: "Drone racing",
    text: "Tezlik va aniqlik: musobaqa darajasida uchirish texnikasi.",
    image: "/images/product-starter.png",
  },
  {
    title: "Drone loyihalash",
    text: "Dronni yig'ish, sozlash va ehtiyot qismlar bilan ishlash.",
    image: "/images/product-racer.png",
  },
  {
    title: "Drone soccer",
    text: "Jamoa bo'lib o'ynash — muhandislik va taktika birga.",
    image: "/images/product-soccer.png",
  },
];

const polygons = [
  { region: "Toshkent shahri", count: "2 ta poligon" },
  { region: "Nukus shahri", count: "1 ta poligon" },
  { region: "Buxoro viloyati", count: "1 ta poligon" },
];

const results = [
  { label: "B2G mijozlar", value: "4", hint: "Davlat tashkilotlari" },
  { label: "Sotuv hajmi", value: "650 mln so'm", hint: "Erishilgan aylanma" },
  { label: "Ustozlar", value: "14+", hint: "Sertifikatlangan instruktorlar" },
];

const revenue = [
  "Online darslik — 15–40 yoshdagi iqtidorli yoshlar uchun pulli kurslar.",
  "Dron poligon — poligonlarni ko'paytirish va yangi hududlarda ochish.",
  "Hamkorlik — do'kon va kompaniyalar bilan reklama hamda hamkorlik.",
  "Dronlar savdosi — modifikatsiya va qishloq xo'jaligida foydalanish.",
  "B2B va B2C — xususiy va o'quv markazlar, maktablar bilan shartnomalar.",
  "Tavsiya va branding — hamkorlar orqali brend daromadi.",
];

const market = [
  {
    tone: "TAM" as const,
    value: "9,43 mln",
    title: "Umumiy bozor",
    text: "O'zbekistonda 14–30 yoshdagi yoshlar soni.",
  },
  {
    tone: "SAM" as const,
    value: "1 535 000",
    title: "Mavjud bozor",
    text: "2025/2026 o'quv yilida oliy ta'lim talabalari soni.",
  },
  {
    tone: "SOM" as const,
    value: "76 000",
    title: "Qamrab olinadigan bozor",
    text: "Dastlabki bosqichda loyihadan 5% (≈76 ming foydalanuvchi).",
  },
];

const team = [
  { name: "Umid Atoyev", role: "CEO · Dronlar bo'yicha xalqaro o'qituvchi" },
  { name: "Umarbek Ulug'bekov", role: "Co-Founder · Xalqaro darajadagi o'qituvchi" },
  { name: "Oybek Babatov", role: "CTO · President Tech Award g'olibi" },
  { name: "Samandar Temirxo'jayev", role: "Founder · Kingsman webapp, Dotcrew.app" },
  { name: "Bobur Xasanov", role: "CEO · Harbiy sohadagi loyihalar asoschisi" },
  { name: "Fayzullo Lutfullayev", role: "Jamoa a'zosi" },
];

const advisors = [
  {
    name: "To'ychiyev Olmasjon Allajonovich",
    role: "Loyiha maslahatchisi · Dron federatsiyasi raisi",
  },
  {
    name: "Inomiddinov Mansurjon G'ayratovich",
    role: "Loyiha maslahatchisi · Mudofaa sanoati agentligi vakili",
  },
];

const partners = [
  "Turin Polytechnic University in Tashkent",
  "Raqamli texnologiyalar vazirligi",
  "UZDF",
  "FAI",
  "Toshkent davlat texnika universiteti",
  "Mudofaa sanoati agentligi",
  "Mudofaa vazirligi",
];

/* ------------------------------------------------------------------ mavjud mahsulot */

const features = [
  {
    title: "Geozonalar",
    description:
      "RED, YELLOW va GREEN zonalar interaktiv xaritada. Parvoz nuqtasi qaysi zonada ekanini bir bosishda tekshiring.",
    icon: "map" as const,
  },
  {
    title: "Video akademiya",
    description:
      "Video va matnli darslar, taymer nazorati va kurslar bo'yicha ketma-ket o'quv yo'li.",
    icon: "book" as const,
  },
  {
    title: "EXP va darajalar",
    description:
      "Har bir yakunlangan dars uchun EXP oling, darajani oshiring va yutuqlaringizni kuzatib boring.",
    icon: "spark" as const,
  },
  {
    title: "Xavfsizlik va rollar",
    description:
      "PILOT, MODERATOR, ADMIN va SUPERADMIN rollari, JWT va refresh token rotatsiyasi bilan xavfsiz kirish.",
    icon: "shield" as const,
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
      "Akademiya darslarini tugatib, geozonalar va poligonlar bilan ishlashni o'rganing.",
  },
  {
    number: "03",
    title: "Sertifikat va EXP oling",
    description:
      "Har bir dars uchun EXP yig'ing, kursni yakunlab raqamli sertifikat oling.",
  },
];

/* ------------------------------------------------------------------------- sahifa */

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      {/* Hero */}
      <section className="fade-up relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-14rem] h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col items-start gap-6">
            <Badge tone="emerald">
              O&apos;zbekistondagi yagona aviatsiya ekotizimi
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                DRONCHI
              </span>{" "}
              — dronlardan aviatsiyaga olib boruvchi platforma
            </h1>
            <p className="max-w-2xl text-lg text-neutral-400">
              Online o&apos;quv dasturi, milliy simulyator, poligonlar xaritasi,
              maxsus dronlar va soha yangiliklari — barchasi bitta ekotizimda.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/academy" className={buttonClasses({ size: "lg" })}>
                Akademiyani boshlash
              </Link>
              <Link
                href="/zones"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Poligonlar xaritasi
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-neutral-400 underline-offset-4 transition hover:text-white hover:underline"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="floaty relative h-[22rem] w-full overflow-hidden rounded-3xl border border-white/[0.08]">
              <Image
                src="/images/course-fpv.png"
                alt="FPV dron"
                fill
                sizes="(max-width: 1024px) 0px, 520px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/20 to-transparent" />
            </div>

            <div className="absolute -bottom-5 -left-6 rounded-2xl border border-white/10 bg-[#070d1c]/90 px-4 py-3 shadow-xl backdrop-blur-xl">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Milliy simulyator
              </span>
              <span className="text-sm font-semibold text-white">40+ soat amaliyot</span>
            </div>

            <div className="absolute -right-5 -top-5 rounded-2xl border border-white/10 bg-[#070d1c]/90 px-4 py-3 shadow-xl backdrop-blur-xl">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                Poligonlar
              </span>
              <span className="text-sm font-semibold text-white">Toshkent · Nukus · Buxoro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ko'rsatkichlar */}
      <section className="fade-up relative z-10 mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat) => (
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

      {/* Biz o'zi kimmiz */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="emerald">Biz o&apos;zi kimmiz</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Amaliy natijalar bilan tasdiqlangan tajriba
          </h2>
          <p className="max-w-2xl text-neutral-400">
            Maktablardan harbiy qismlargacha, xalqaro maydonlarda
            qatnashuvchi jamoagacha.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {about.map((item) => (
            <Tilt key={item.title}>
              <Card hover className="flex h-full flex-col gap-4 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                  <Icon name={item.icon} />
                </span>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <ul className="flex flex-col gap-1.5">
                  {item.lines.map((line) => (
                    <li key={line} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Icon name="check" className="h-3.5 w-3.5 text-emerald-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </Card>
            </Tilt>
          ))}
        </div>
      </section>

      {/* Muammolar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="red">Muammolar</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bugungi to&apos;siqlar
          </h2>
          <p className="max-w-2xl text-neutral-400">
            Darslikdan poligongacha — zanjirning har bir bo&apos;g&apos;inida
            uzilish bor.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {problems.map((problem, index) => (
            <Card key={problem.step} className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                  <Icon name="warn" className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {index + 1}. {problem.step}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{problem.title}</h3>
              <p className="text-xs leading-relaxed text-neutral-400">{problem.text}</p>
            </Card>
          ))}
        </div>
        <Card glow className="mt-4 flex flex-col items-start gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <Icon name="bolt" className="h-4 w-4" />
            </span>
            <p className="text-base font-semibold text-white">
              Yagona muammo — aniq bir ekotizim yo&apos;qligi
            </p>
          </div>
          <p className="text-sm text-neutral-400">
            Uskunalar, dastur, uchish joylari, ta&apos;lim, do&apos;kon va
            musobaqalar bir joyda bo&apos;lishi kerak.
          </p>
        </Card>
      </section>

      {/* DRONCHI ekotizimi */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="sky">DRONCHI nima</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Beshta ustun, bitta ekotizim
          </h2>
          <p className="max-w-2xl text-neutral-400">
            Aviatsiya sohasi uchun mo&apos;ljallangan yagona platforma —
            o&apos;qishdan xaridgacha.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <Tilt key={pillar.n}>
              <Card hover className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    {pillar.n}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                    <Icon name={pillar.icon} className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-neutral-400">{pillar.text}</p>
              </Card>
            </Tilt>
          ))}
        </div>
      </section>

      {/* Platforma imkoniyatlari */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="flex flex-col gap-4">
            <Badge tone="violet">Platforma</Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Dron texnologiyalariga olib boruvchi yagona platforma
            </h2>
            <ul className="mt-2 flex flex-col gap-3">
              {platformPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-300">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
          <Tilt>
            <Card glow className="flex flex-col gap-4 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                <Icon name="drone" className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-white">Milliy simulyator</h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Xalqaro standartlarga muvofiq, real dronni boshqarishdan avval
                simulyatorda <span className="text-white">40 soatdan ortiq</span>{" "}
                amaliy mashg&apos;ulot talab etiladi.
              </p>
              <p className="text-sm leading-relaxed text-neutral-400">
                Simulyator uchun oylik obuna modeli — ilova uchun qo&apos;shimcha
                va barqaror daromad manbai.
              </p>
            </Card>
          </Tilt>
        </div>
      </section>

      {/* Kurslar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="sky">Akademiya</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Professional darajadagi online kurslar
          </h2>
          <p className="max-w-2xl text-neutral-400">
            3 yillik tajriba asosida tuzilgan dastur: yig&apos;ish, uchirish va
            foydalanish madaniyati.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {courses.map((course, index) => (
            <Tilt key={course.title}>
              <Card hover className="flex h-full flex-col overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
                  <span className="absolute bottom-3 left-4 bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    0{index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-base font-semibold text-white">{course.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{course.text}</p>
                </div>
              </Card>
            </Tilt>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/academy"
            className={buttonClasses({ variant: "secondary", size: "md" })}
          >
            Barcha kurslar
          </Link>
        </div>
      </section>

      {/* Poligonlar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="amber">Poligonlar</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Respublika bo&apos;ylab maxsus dron poligonlar
          </h2>
          <p className="max-w-3xl text-neutral-400">
            Ichki ishlar vazirligi bilan hamkorlikda har bir viloyatda
            poligonlar qurilmoqda. Jamoamiz poligonlar dizayni, joylashuvi va
            texnik mas&apos;uliyatini oladi.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card className="flex flex-col gap-3 p-6">
            {polygons.map((polygon) => (
              <div
                key={polygon.region}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium text-white">{polygon.region}</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
                  {polygon.count}
                </span>
              </div>
            ))}
            <Link
              href="/zones"
              className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-1 self-start" })}
            >
              Xaritada ko&apos;rish
            </Link>
          </Card>
          <Card className="flex flex-col overflow-hidden">
            <div className="relative h-40 w-full">
              <Image
                src="/images/news-polygons.png"
                alt="Dron poligonlari"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
            </div>
            <div className="flex flex-col gap-3 p-6">
              <h3 className="text-base font-semibold text-white">
                Xarid va hamkorlik
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Qonunchilikka mos ravishda{" "}
                <span className="text-white">250 gramdan oshmagan</span> maxsus
                professional dronlar.
              </p>
              <p className="text-sm leading-relaxed text-neutral-400">
                Mudofaa sanoati agentligi va Turin politexnika universiteti bilan
                hamkorlikda ishlab chiqarish va ta&apos;minot — tannarxni
                kamaytiradi va mahalliy sanoatni rivojlantiradi.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Natijalar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="emerald">Erishilgan natijalar</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Raqamlar bilan
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {results.map((item) => (
            <Tilt key={item.label}>
              <StatCard
                label={item.label}
                value={item.value}
                hint={item.hint}
                accent="emerald"
                className="h-full"
              />
            </Tilt>
          ))}
        </div>
      </section>

      {/* Biznes model + bozor */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="flex flex-col gap-4 p-6">
            <Badge tone="violet">Biznes model</Badge>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Asosiy daromad yo&apos;llari
            </h2>
            <ul className="flex flex-col gap-2.5">
              {revenue.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-300">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex flex-col gap-4 p-6">
            <Badge tone="sky">Bozor hajmi</Badge>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              TAM · SAM · SOM
            </h2>
            <div className="flex flex-col gap-3">
              {market.map((item) => (
                <div
                  key={item.tone}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {item.tone}
                    </span>
                    <span className="text-lg font-semibold text-emerald-400">
                      {item.value}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Jamoa */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="neutral">Jamoa</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Loyiha ortidagi odamlar
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <Card key={member.name} hover className="flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-sm font-semibold text-emerald-300">
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{member.name}</span>
                <span className="text-xs leading-relaxed text-neutral-400">{member.role}</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {advisors.map((advisor) => (
            <Card key={advisor.name} className="flex items-center gap-4 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                <Icon name="shield" className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Loyiha maslahatchisi
                </span>
                <span className="text-sm font-semibold text-white">{advisor.name}</span>
                <span className="text-xs text-neutral-400">{advisor.role}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Hamkorlar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col items-start gap-3">
          <Badge tone="neutral">Hamkorlarimiz</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bizga ishonch bildirgan tashkilotlar
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {partners.map((partner) => (
            <span
              key={partner}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-neutral-300"
            >
              {partner}
            </span>
          ))}
        </div>
      </section>

      {/* Mahsulot imkoniyatlari */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="emerald">Platforma ichida</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Hoziroq foydalanish mumkin bo&apos;lgan bo&apos;limlar
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
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                  <Icon name={feature.icon} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Tilt>
          ))}
        </div>
      </section>

      {/* Qanday ishlaydi */}
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
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Do'kon va yangiliklar */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Badge tone="sky">Ekotizim</Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Do&apos;kon va yangiliklar
          </h2>
          <p className="max-w-2xl text-neutral-400">
            O&apos;quv dronlarini xarid qiling va sohadagi so&apos;nggi
            yangiliklardan xabardor bo&apos;ling.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Tilt>
            <Card hover className="flex h-full flex-col overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src="/images/product-racer.png"
                  alt="Dron do'koni"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                  <Icon name="cart" />
                </span>
                <h3 className="text-base font-semibold text-white">Dron do&apos;koni</h3>
                <p className="flex-1 text-sm leading-relaxed text-neutral-400">
                  Qonunchilikka mos, 250 gramdan oshmagan o&apos;quv dronlari,
                  FPV va Drone soccer to&apos;plamlari.
                </p>
                <Link
                  href="/shop"
                  className={buttonClasses({ variant: "secondary", size: "sm", className: "self-start" })}
                >
                  Do&apos;konga o&apos;tish
                </Link>
              </div>
            </Card>
          </Tilt>
          <Tilt>
            <Card hover className="flex h-full flex-col overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src="/images/news-ecosystem.png"
                  alt="Yangiliklar"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                  <Icon name="news" />
                </span>
                <h3 className="text-base font-semibold text-white">Yangiliklar</h3>
                <p className="flex-1 text-sm leading-relaxed text-neutral-400">
                  Poligonlar, simulyator, kurslar va musobaqalar bo&apos;yicha
                  sohadagi so&apos;nggi xabarlar.
                </p>
                <Link
                  href="/news"
                  className={buttonClasses({ variant: "secondary", size: "sm", className: "self-start" })}
                >
                  Yangiliklarni ko&apos;rish
                </Link>
              </div>
            </Card>
          </Tilt>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-up mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6">
        <Card glow className="overflow-hidden p-8 text-center sm:p-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
            <Badge tone="emerald">Bepul boshlash</Badge>
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
            DRONCHI · Aviatsiya ekotizimi · {new Date().getFullYear()}
          </span>
          <nav className="flex items-center gap-5">
            <Link href="/zones" className="transition hover:text-neutral-300">
              Poligonlar
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
