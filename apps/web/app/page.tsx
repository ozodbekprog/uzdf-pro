import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Tilt } from "@/components/ui/Tilt";

/* ---------------------------------- Ikonkalar ---------------------------------- */

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
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  warn: (
    <>
      <path d="M12 4.5 3.5 19.5h17L12 4.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12l1-7Z" />,
  trophy: (
    <>
      <path d="M7 4h10v4.5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M9.5 20h5M12 13.5V20" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
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

/* ----------------------------------- Kontent ----------------------------------- */

const bigStats = [
  { value: "35+", label: "Maktab va universitet", sub: "4 universitet hamkor" },
  { value: "4000+", label: "O'qitilgan yoshlar", sub: "Amaliy kurslarda" },
  { value: "1000+", label: "Harbiy xizmatchi", sub: "Maxsus tayyorlov" },
  { value: "20+", label: "Xalqaro medallar", sub: "10+ davlatda" },
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
    text: "Ko'nikmalarni maxsus simulyatorlarda mashq qilib bo'lmaydi.",
  },
  {
    step: "Dron",
    title: "Foydalanish taqiqlangan",
    text: "O'zbekiston Respublikasida drondan foydalanish cheklangan.",
  },
  {
    step: "Poligon",
    title: "Maxsus poligonlar yo'q",
    text: "Dron uchirish uchun qonuniy va xavfsiz hududlar yetarli emas.",
  },
  {
    step: "Kelajak",
    title: "Kimga murojaat noaniq",
    text: "Sohada davom etmoqchilar yo'l xaritasini bilmaydi.",
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
    text: "Soha va dronlarga oid yangiliklardan doimiy xabardor bo'lish.",
  },
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
  { region: "Toshkent shahri", count: "2 ta" },
  { region: "Nukus shahri", count: "1 ta" },
  { region: "Buxoro viloyati", count: "1 ta" },
];

const results = [
  { value: "4", label: "B2G mijoz", sub: "Davlat tashkilotlari" },
  { value: "650 mln", label: "So'mlik sotuv", sub: "Erishilgan aylanma" },
  { value: "14+", label: "Ustozlar", sub: "Sertifikatlangan" },
];

const market = [
  { tone: "TAM", value: "9,43 mln", title: "Umumiy bozor", text: "14–30 yoshdagi yoshlar soni." },
  { tone: "SAM", value: "1 535 000", title: "Mavjud bozor", text: "Oliy ta'lim talabalari soni." },
  { tone: "SOM", value: "76 000", title: "Qamrab olinadigan", text: "Dastlabki bosqichda 5% qamrov." },
];

const team = [
  { name: "Umid Atoyev", role: "CEO · Xalqaro o'qituvchi" },
  { name: "Umarbek Ulug'bekov", role: "Co-Founder" },
  { name: "Oybek Babatov", role: "CTO · President Tech Award g'olibi" },
  { name: "Samandar Temirxo'jayev", role: "Founder · Kingsman webapp" },
  { name: "Bobur Xasanov", role: "CEO · Harbiy loyihalar" },
  { name: "Fayzullo Lutfullayev", role: "Jamoa a'zosi" },
];

const advisors = [
  { name: "To'ychiyev O. A.", role: "Dron federatsiyasi raisi" },
  { name: "Inomiddinov M. G'.", role: "Mudofaa sanoati agentligi" },
];

const partners = [
  "Turin Polytechnic University",
  "Raqamli texnologiyalar vazirligi",
  "UZDF",
  "FAI",
  "Toshkent davlat texnika universiteti",
  "Mudofaa sanoati agentligi",
  "Mudofaa vazirligi",
];

const ticker = [
  "Online o'quv dasturi",
  "Milliy simulyator",
  "Poligonlar xaritasi",
  "Maxsus dronlar",
  "Sertifikat",
  "Reyting",
  "Do'kon",
  "Yangiliklar",
  "Geozonalar",
];

/* ----------------------------------- Sahifa ----------------------------------- */

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-24">
          <div className="flex flex-col items-start gap-7">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-glow" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              O&apos;zbekistondagi yagona aviatsiya ekotizimi
            </span>

            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              <span className="shine-text">DRONCHI</span>
              <span className="block text-white/90">
                dronlardan aviatsiyaga
              </span>
              <span className="block gradient-text">yagona yo&apos;l</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
              Online o&apos;quv dasturi, milliy simulyator, poligonlar xaritasi,
              maxsus dronlar va soha yangiliklari — bitta ekotizimda.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/academy"
                className={buttonClasses({ size: "lg", className: "ring-glow" })}
              >
                Akademiyani boshlash
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                href="/zones"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Poligonlar xaritasi
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-neutral-500">
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-400" />
                35+ maktab
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-400" />
                4000+ yosh
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-400" />
                Sertifikat bilan
              </span>
            </div>
          </div>

          <div className="relative on-dark">
            <div className="gradient-border floaty relative h-[24rem] w-full overflow-hidden rounded-[2rem] sm:h-[28rem]">
              <Image
                src="/images/course-fpv.png"
                alt="FPV dron"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/35 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div className="glass-strong rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                    Milliy simulyator
                  </p>
                  <p className="text-sm font-semibold text-white">40+ soat amaliyot</p>
                </div>
                <div className="glass-strong rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
                    Poligonlar
                  </p>
                  <p className="text-sm font-semibold text-white">4 ta hudud</p>
                </div>
              </div>
            </div>

            <div className="glass-strong absolute -left-4 top-8 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Daraja</p>
              <p className="font-display text-xl font-bold text-white">Lv 12</p>
            </div>
            <div className="glass-strong absolute -right-4 bottom-24 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">EXP</p>
              <p className="font-display text-xl font-bold text-emerald-400">+340</p>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="marquee-mask border-y border-white/[0.06] bg-white/[0.015] py-4">
          <div className="marquee-track">
            {[...ticker, ...ticker].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="mx-6 flex items-center gap-3 whitespace-nowrap text-sm font-medium text-neutral-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ STATISTIKA ------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bigStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`glass mesh-card rise rise-${index + 1} rounded-3xl p-6`}
            >
              <p className="font-display text-4xl font-extrabold gradient-text">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ BIZ KIMMIZ ------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <Badge tone="emerald">Biz o&apos;zi kimmiz</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Amaliy natijalar bilan tasdiqlangan tajriba
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <div className="glass card-hover relative on-dark overflow-hidden rounded-3xl lg:col-span-2 lg:row-span-2">
            <div className="relative h-72 w-full sm:h-96">
              <Image
                src="/images/news-polygons.png"
                alt="Poligonlar"
                fill
                sizes="(max-width: 1024px) 100vw, 820px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
                IIV bilan hamkorlik
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                Respublika bo&apos;ylab maxsus dron poligonlari
              </h3>
              <p className="mt-2 max-w-xl text-sm text-neutral-300">
                Har bir viloyatda poligonlar qurilmoqda. Jamoamiz dizayn, joylashuv va
                texnik mas&apos;uliyatni oladi.
              </p>
            </div>
          </div>

          <div className="glass card-hover rounded-3xl p-6">
            <Icon name="trophy" className="h-6 w-6 text-amber-300" />
            <p className="mt-4 font-display text-3xl font-bold text-white">10+ davlat</p>
            <p className="mt-1 text-sm text-neutral-400">
              Xalqaro musobaqalarda qatnashish va federatsiyalarga a&apos;zolik.
            </p>
          </div>

          <div className="glass card-hover rounded-3xl p-6">
            <Icon name="bolt" className="h-6 w-6 text-cyan-300" />
            <p className="mt-4 font-display text-3xl font-bold text-white">14 ta hudud</p>
            <p className="mt-1 text-sm text-neutral-400">
              Dron va robototexnika markazlari, 40 mingdan ortiq ishtirokchi.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------- MUAMMO → YECHIM ------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="glass rounded-3xl p-7">
            <Badge tone="red">Muammolar</Badge>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">
              Bugungi to&apos;siqlar
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {problems.map((problem, index) => (
                <li key={problem.step} className={`rise rise-${index + 1} flex gap-3`}>
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-300">
                    <Icon name="warn" className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{problem.title}</p>
                    <p className="text-xs text-neutral-400">{problem.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="gradient-border ring-glow rounded-3xl bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.03] to-transparent p-7">
            <Badge tone="emerald">Yechim</Badge>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">
              DRONCHI — yagona ekotizim
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              Uskunalar, dastur, uchish joylari, ta&apos;lim, do&apos;kon va musobaqalar
              bir joyda. Bitta akkaunt bilan nazariyadan birinchi parvozgacha.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Masofadan o'qish imkoniyati",
                "To'liq nazariy mashg'ulot",
                "Dronlarni xarid qilish",
                "Real vaqtda amaliyot",
              ].map((item) => (
                <div key={item} className="glass flex items-start gap-2.5 rounded-2xl p-3.5">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-xs text-neutral-300">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className={buttonClasses({ size: "md", className: "mt-6" })}
            >
              Bepul boshlash
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ EKOTIZIM ------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <Badge tone="sky">Ekotizim</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Beshta ustun, bitta platforma
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar, index) => (
            <Tilt key={pillar.n}>
              <div className={`glass card-hover mesh-card rise rise-${index + 1} flex h-full flex-col gap-4 rounded-3xl p-5`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold gradient-text">
                    {pillar.n}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-300">
                    <Icon name={pillar.icon} className="h-4.5 w-4.5" />
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-neutral-400">{pillar.text}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* ------------------------------ KURSLAR ------------------------------ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Badge tone="sky">Akademiya</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Professional online kurslar
            </h2>
            <p className="max-w-xl text-neutral-400">
              3 yillik tajriba asosida: yig&apos;ish, uchirish va foydalanish madaniyati.
            </p>
          </div>
          <Link
            href="/academy"
            className={buttonClasses({ variant: "secondary", size: "md" })}
          >
            Barcha kurslar
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {courses.map((course, index) => (
            <Tilt key={course.title}>
              <div className={`glass card-hover rise rise-${index + 1} flex h-full flex-col overflow-hidden rounded-3xl`}>
                <div className="relative on-dark h-44 w-full">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] via-[#050a17]/30 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-display text-3xl font-extrabold text-white/90">
                    0{index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-display text-base font-bold text-white">{course.title}</h3>
                  <p className="text-sm text-neutral-400">{course.text}</p>
                </div>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* ----------------------- POLIGONLAR + NATIJALAR ----------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-3xl p-7">
            <Badge tone="amber">Poligonlar</Badge>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">
              Respublika bo&apos;ylab uchish maydonlari
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {polygons.map((item) => (
                <li
                  key={item.region}
                  className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-neutral-200">{item.region}</span>
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-xs font-medium text-amber-300">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/zones"
              className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-6" })}
            >
              Xaritada ko&apos;rish
            </Link>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl">
            <div className="relative h-56 w-full">
              <Image
                src="/images/news-simulator.png"
                alt="Milliy simulyator"
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a17] to-transparent" />
            </div>
            <div className="p-7">
              <Badge tone="violet">Simulyator</Badge>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                Xalqaro standartlarga mos milliy simulyator
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Real dronni boshqarishdan avval simulyatorda 40 soatdan ortiq amaliy
                mashg&apos;ulot talab etiladi. Oylik obuna modeli joriy etilgan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {results.map((item, index) => (
            <div key={item.label} className={`glass card-hover rise rise-${index + 1} rounded-3xl p-6`}>
              <p className="font-display text-3xl font-extrabold gradient-text">{item.value}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-1 text-xs text-neutral-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------- BOZOR -------------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="glass mesh-card rounded-3xl p-7 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <Badge tone="sky">Bozor hajmi</Badge>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                TAM · SAM · SOM
              </h2>
            </div>
            <p className="max-w-md text-sm text-neutral-400">
              O&apos;zbekistonda 14–30 yoshdagi 9,43 million yosh va 1,5 milliondan ortiq
              talaba — platformaning asosiy auditoriyasi.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {market.map((item, index) => (
              <div key={item.tone} className={`glass-strong rise rise-${index + 1} rounded-2xl p-5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    {item.tone}
                  </span>
                  <span className="font-display text-xl font-bold text-emerald-400">
                    {item.value}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- JAMOA -------------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <Badge tone="neutral">Jamoa</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Loyiha ortidagi odamlar
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div key={member.name} className={`glass card-hover rise rise-${(index % 6) + 1} flex items-center gap-4 rounded-2xl p-4`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-[#04121f]">
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{member.name}</span>
                <span className="text-xs text-neutral-400">{member.role}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {advisors.map((advisor) => (
            <div key={advisor.name} className="glass flex items-center gap-4 rounded-2xl p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                <Icon name="trophy" className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Loyiha maslahatchisi
                </span>
                <span className="text-sm font-semibold text-white">{advisor.name}</span>
                <span className="text-xs text-neutral-400">{advisor.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------- HAMKORLAR ------------------------------- */}
      <section className="py-16">
        <div className="mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6">
          <Badge tone="neutral">Hamkorlarimiz</Badge>
        </div>
        <div className="marquee-mask">
          <div className="marquee-track">
            {[...partners, ...partners].map((partner, index) => (
              <span
                key={`${partner}-${index}`}
                className="glass mx-2 whitespace-nowrap rounded-2xl px-5 py-3 text-sm text-neutral-300"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- CTA ---------------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="gradient-border relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.16] via-white/[0.04] to-transparent p-8 text-center sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <Badge tone="emerald">Bepul boshlash</Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Birinchi darsni bugun boshlang
            </h2>
            <p className="text-neutral-300">
              Ro&apos;yxatdan o&apos;ting, kursga yoziling va EXP yig&apos;ishni hoziroq
              boshlang.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className={buttonClasses({ size: "lg", className: "ring-glow" })}>
                Ro&apos;yxatdan o&apos;tish
              </Link>
              <Link
                href="/academy"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                Akademiyani ko&apos;rish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- FOOTER -------------------------------- */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-[#04121f]">
              D
            </span>
            <span className="font-display font-bold text-white">
              DRON<span className="text-emerald-400">CHI</span>
            </span>
            <span className="text-neutral-600">· {new Date().getFullYear()}</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/zones" className="transition hover:text-neutral-300">
              Poligonlar
            </Link>
            <Link href="/academy" className="transition hover:text-neutral-300">
              Akademiya
            </Link>
            <Link href="/news" className="transition hover:text-neutral-300">
              Yangiliklar
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
