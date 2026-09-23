import bcrypt from "bcryptjs";
import { PrismaClient, Role, ZoneType } from "@prisma/client";

const prisma = new PrismaClient();

const TASHKENT_AIRPORT: Array<[number, number]> = [
  [41.272, 69.25],
  [41.272, 69.318],
  [41.242, 69.318],
  [41.242, 69.25]
];

const TASHKENT_CENTER: Array<[number, number]> = [
  [41.36, 69.2],
  [41.36, 69.36],
  [41.24, 69.36],
  [41.24, 69.2]
];

const CHIRCHIQ_POLYGON: Array<[number, number]> = [
  [41.52, 69.54],
  [41.52, 69.66],
  [41.44, 69.66],
  [41.44, 69.54]
];

const lessons = [
  {
    position: 1,
    title: "FPV dron nima va u qanday uchadi?",
    minReadSeconds: 60,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    content:
      "FPV (First Person View) dron — uchuvchi ko'zoynak orqali real vaqtda dronning kamerasidan ko'radigan BPLA. Ushbu darsda: kvadrokopter tuzilishi, motorlar va propellerlar, flight controller vazifasi, batareya turlari (LiPo/Li-Ion) va xavfsizlik qoidalari bilan tanishamiz."
  },
  {
    position: 2,
    title: "O'zbekistonda havo hududi qoidalari",
    minReadSeconds: 90,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    content:
      "O'zbekiston havo hududida BPLA uchirish tartiblari. RED zona — uchish taqiqlangan (aeroportlar, strategik obyektlar), YELLOW zona — cheklangan (ruxsat talab qilinadi), GREEN zona — erkin uchish mumkin. Har bir reys oldidan geozonalarni tekshirish majburiy."
  },
  {
    position: 3,
    title: "Birinchi parvoz: sozlash va sinov",
    minReadSeconds: 120,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    content:
      "Birinchi parvozdan oldin: transmitter-receiver binding, betaflight sozlamalari, failsafe tekshiruvi, GPS lock kutish, kalibrlash. Parvoz oldidan 5 daqiqalik checklist: pervanellar mahkamligi, batareya kuchlanishi, antennalar, video signal."
  }
];

const havoHuquqiLessons = [
  {
    position: 1,
    title: "BPLA bo'yicha qonunchilik asoslari",
    minReadSeconds: 60,
    videoUrl: null,
    content:
      "O'zbekistonda BPLA (BPLA) uchirishni tartibga soluvchi asosiy hujjatlar: Havo kodeksi, Fuqaro aviatsiyasi agentligi talablari va mahalliy hokimiyat qarorlari. Ushbu darsda uchuvchining huquq va majburiyatlari, ro'yxatdan o'tish tartibi va javobgarlik choralari ko'rib chiqiladi."
  },
  {
    position: 2,
    title: "Xavfsizlik qoidalari va javobgarlik",
    minReadSeconds: 90,
    videoUrl: null,
    content:
      "BPLA parvozlari xavfsizligi: odamlar ustidan uchish taqiqi, maksimal balandlik va masofa cheklovlari, tungi parvozlar, havo harakati bilan muvofiqlashtirish. Qoidalar buzilganda ma'muriy va jinoiy javobgarlik, sug'urta talablari haqida ma'lumot."
  }
];

const newsItems = [
  {
    slug: "dronchi-ekotizimi-ishga-tushdi",
    title: "DRONCHI ekotizimi ishga tushdi",
    summary:
      "Online o'quv dasturi, milliy simulyator, poligonlar xaritasi va maxsus dronlar — bitta platformada.",
    category: "Platforma",
    cover: "/images/news-ecosystem.png",
    body:
      "DRONCHI — O'zbekistondagi yagona, aviatsiya sohasi uchun mo'ljallangan ekotizim.\n\nPlatforma besh ustunga tayanadi: online o'quv dasturi, milliy simulyator, poligonlar xaritasi, maxsus dronlar va soha yangiliklari. Endi uchuvchilar nazariy bilim, amaliy mashg'ulot va xarid jarayonini bir joyda olib borishi mumkin."
  },
  {
    slug: "toshkentda-ikki-dron-poligoni",
    title: "Toshkentda ikkita dron poligoni ishga tushdi",
    summary:
      "IIV bilan hamkorlikda respublikaning har bir viloyatida maxsus poligonlar qurilmoqda.",
    category: "Poligonlar",
    cover: "/images/news-polygons.png",
    body:
      "Ichki ishlar vazirligi bilan hamkorlikda yurtimizning har bir viloyatida dronlar uchun mo'ljallangan maxsus poligonlar qurilmoqda. Jamoa poligonlarning dizayni, joylashuvi va texnik mas'uliyatini oladi.\n\nAyni vaqtda Toshkent shahrida ikkita, Nukus shahrida va Buxoro viloyatida bittadan poligon mavjud. Poligonlar xaritasi platformada interaktiv ko'rinishda."
  },
  {
    slug: "milliy-simulyator-40-soat",
    title: "Milliy simulyator: 40 soatdan ortiq amaliy mashg'ulot",
    summary:
      "Xalqaro standartlarga moslashtirilgan simulyator real dronni boshqarishdan avval talab etiladi.",
    category: "Simulyator",
    cover: "/images/news-simulator.png",
    body:
      "Xalqaro standartlarga muvofiq, real dronni boshqarishdan avval simulyatorlarda 40 soatdan ortiq amaliy mashg'ulot o'tkazish talab etiladi.\n\nDronlar sohasidagi 3 yillik tajriba asosida O'zbekiston va xalqaro standartlar talablariga moslashtirilgan milliy simulyator ishlab chiqildi. Simulyator uchun oylik obuna modeli joriy etilgan."
  },
  {
    slug: "drone-racing-loyihalash-soccer-kurslari",
    title: "Drone racing, loyihalash va soccer kurslari ochildi",
    summary:
      "3 yillik tajriba asosidagi professional darajadagi online kurslar uch bosqichdan iborat.",
    category: "Akademiya",
    cover: "/images/news-courses.png",
    body:
      "Kurs davomida nafaqat dronni yig'ish, balki uni uchirish va dronlardan to'g'ri foydalanish madaniyati o'rgatiladi.\n\nBoshlang'ich jarayon uch bosqichdan iborat: Drone racing, Drone loyihalash va Drone soccer. Har bir dars yakunida test topshiriladi va muvaffaqiyatli yakunlangan kurs uchun raqamli sertifikat beriladi."
  }
];

const products = [
  {
    slug: "dronchi-starter-250",
    name: "DRONCHI Starter 250",
    description:
      "O'quv uchun mo'ljallangan, 250 grammdan oshmagan dron. Boshlang'ich kurslar uchun ideal.",
    category: "O'quv dronlari",
    price: 3_500_000,
    stock: 12,
    imageUrl: "/images/product-starter.png"
  },
  {
    slug: "dronchi-racer-fpv",
    name: "DRONCHI Racer FPV",
    description: "Drone racing yo'nalishi uchun tezkor FPV dron to'plami.",
    category: "FPV",
    price: 7_200_000,
    stock: 6,
    imageUrl: "/images/product-racer.png"
  },
  {
    slug: "dronchi-soccer-cage",
    name: "DRONCHI Soccer Cage",
    description: "Drone soccer uchun himoya karkasi bilan jihozlangan model.",
    category: "Drone soccer",
    price: 4_800_000,
    stock: 4,
    imageUrl: "/images/product-soccer.png"
  },
  {
    slug: "dronchi-simulator-kit",
    name: "Milliy simulyator to'plami",
    description:
      "Uyda mashq qilish uchun transmitter va simulyator litsenziyasi (1 oylik obuna).",
    category: "Aksessuarlar",
    price: 1_200_000,
    stock: 20,
    imageUrl: "/images/product-sim-kit.png"
  }
];

const quizzes: Array<{
  courseSlug: string;
  position: number;
  title: string;
  passScore: number;
  questions: Array<{ text: string; options: string[]; correct: number }>;
}> = [
  {
    courseSlug: "fpv-asoslari",
    position: 1,
    title: "FPV dron asoslari testi",
    passScore: 70,
    questions: [
      {
        text: "FPV qisqartmasi nimani anglatadi?",
        options: [
          "First Person View",
          "Fast Propeller Vehicle",
          "Flight Path Visual",
          "Full Power Voltage"
        ],
        correct: 0
      },
      {
        text: "Kvadrokopterda nechta motor bo'ladi?",
        options: ["2", "3", "4", "6"],
        correct: 2
      },
      {
        text: "LiPo batareyaning asosiy afzalligi nima?",
        options: [
          "Energiya zichligi yuqori va yengil",
          "Faqat suvda ishlaydi",
          "Quvvat bermaydi",
          "Faqat 1S bo'ladi"
        ],
        correct: 0
      }
    ]
  },
  {
    courseSlug: "fpv-asoslari",
    position: 2,
    title: "Havo hududi qoidalari testi",
    passScore: 70,
    questions: [
      {
        text: "RED zona nimani bildiradi?",
        options: [
          "Uchish qat'iyan taqiqlangan",
          "Erkin uchish mumkin",
          "Faqat tunda uchish mumkin",
          "Cheklangan ruxsat"
        ],
        correct: 0
      },
      {
        text: "GREEN zona qanday zona?",
        options: [
          "Erkin uchish mumkin",
          "Taqiqlangan hudud",
          "Faqat 50 m balandlikda uchish",
          "Faqat harbiy uchun"
        ],
        correct: 0
      },
      {
        text: "Har bir reys oldidan nima qilish majburiy?",
        options: [
          "Geozonalarni tekshirish",
          "Batareyani zaryadsizlantirish",
          "Pervanelarni olib tashlash",
          "GPSni o'chirish"
        ],
        correct: 0
      }
    ]
  },
  {
    courseSlug: "fpv-asoslari",
    position: 3,
    title: "Birinchi parvoz testi",
    passScore: 70,
    questions: [
      {
        text: "Birinchi parvozdan oldin qaysi tekshiruv majburiy?",
        options: [
          "Failsafe tekshiruvi",
          "Kamerani o'chirish",
          "GPSni o'chirish",
          "Motorlarni olib tashlash"
        ],
        correct: 0
      },
      {
        text: "GPS lock nima uchun kerak?",
        options: [
          "Barqaror joylashuv va qaytish uchun",
          "Video uzatish uchun",
          "Batareya quvvati uchun",
          "Motor sovutish uchun"
        ],
        correct: 0
      }
    ]
  },
  {
    courseSlug: "havo-huquqi",
    position: 1,
    title: "BPLA qonunchiligi testi",
    passScore: 70,
    questions: [
      {
        text: "BPLA uchirishni tartibga soluvchi asosiy hujjat qaysi?",
        options: ["Havo kodeksi", "Mehnat kodeksi", "Soliq kodeksi", "Fuqarolik kodeksi"],
        correct: 0
      },
      {
        text: "Uchuvchi javobgarligi qachon yuzaga keladi?",
        options: [
          "Qoidalar buzilganda",
          "Har doim",
          "Hech qachon",
          "Faqat tunda uchirganda"
        ],
        correct: 0
      }
    ]
  },
  {
    courseSlug: "havo-huquqi",
    position: 2,
    title: "Xavfsizlik qoidalari testi",
    passScore: 70,
    questions: [
      {
        text: "Odamlar ustidan uchish qanday baholanadi?",
        options: [
          "Taqiqlanadi",
          "Ruxsat etiladi",
          "Faqat kunduzi ruxsat",
          "Faqat 10 metrda ruxsat"
        ],
        correct: 0
      },
      {
        text: "Tungi parvozlar uchun nima talab qilinadi?",
        options: ["Maxsus ruxsat", "Hech narsa", "Faqat chiroq", "Qo'shimcha batareya"],
        correct: 0
      }
    ]
  }
];

async function main(): Promise<void> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const pilotPassword = process.env.SEED_PILOT_PASSWORD ?? "Pilot123!";

  const admin = await prisma.user.upsert({
    where: { email: "admin@uzdf.pro" },
    update: { role: Role.SUPERADMIN, emailVerified: true },
    create: {
      email: "admin@uzdf.pro",
      fullName: "Platforma admini",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: Role.SUPERADMIN,
      emailVerified: true
    }
  });

  const pilot = await prisma.user.upsert({
    where: { email: "pilot@uzdf.pro" },
    update: { emailVerified: true },
    create: {
      email: "pilot@uzdf.pro",
      fullName: "Test uchuvchi",
      passwordHash: await bcrypt.hash(pilotPassword, 10),
      role: Role.PILOT,
      emailVerified: true
    }
  });

  if ((await prisma.zone.count()) === 0) {
    await prisma.zone.createMany({
      data: [
        {
          name: "Toshkent xalqaro aeroporti (taqiqlangan)",
          type: ZoneType.RED,
          description: "Aeroport atrofida uchish qat'iyan taqiqlanadi",
          polygon: TASHKENT_AIRPORT,
          createdById: admin.id
        },
        {
          name: "Toshkent markazi (cheklangan)",
          type: ZoneType.YELLOW,
          description: "Uchish uchun oldindan ruxsat olish talab qilinadi",
          polygon: TASHKENT_CENTER,
          createdById: admin.id
        },
        {
          name: "Chirchiq o'quv poligoni",
          type: ZoneType.GREEN,
          description: "O'quv va mashq parvozlari uchun erkin zona",
          polygon: CHIRCHIQ_POLYGON,
          createdById: admin.id
        }
      ]
    });
  }

  const course = await prisma.course.upsert({
    where: { slug: "fpv-asoslari" },
    update: { published: true, coverUrl: "/images/course-fpv.png" },
    create: {
      slug: "fpv-asoslari",
      title: "FPV asoslari",
      description: "Noldan birinchi parvozgacha: qurilma, qoidalar va amaliyot",
      coverUrl: "/images/course-fpv.png",
      published: true
    }
  });

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { courseId_position: { courseId: course.id, position: lesson.position } },
      update: {
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        minReadSeconds: lesson.minReadSeconds
      },
      create: { courseId: course.id, ...lesson }
    });
  }

  const havoHuquqi = await prisma.course.upsert({
    where: { slug: "havo-huquqi" },
    update: { published: true, coverUrl: "/images/course-law.png" },
    create: {
      slug: "havo-huquqi",
      title: "Havo huquqi va xavfsizlik",
      description: "O'zbekistonda BPLA bo'yicha huquqiy asoslar",
      coverUrl: "/images/course-law.png",
      published: true
    }
  });

  for (const lesson of havoHuquqiLessons) {
    await prisma.lesson.upsert({
      where: { courseId_position: { courseId: havoHuquqi.id, position: lesson.position } },
      update: {
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        minReadSeconds: lesson.minReadSeconds
      },
      create: { courseId: havoHuquqi.id, ...lesson }
    });
  }

  for (const item of newsItems) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        body: item.body,
        category: item.category,
        coverUrl: item.cover,
        published: true
      },
      create: {
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        body: item.body,
        category: item.category,
        coverUrl: item.cover,
        published: true
      }
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        active: true
      },
      create: { ...product, active: true }
    });
  }

  let quizzesCreated = 0;
  for (const quiz of quizzes) {
    const owner = await prisma.course.findUnique({ where: { slug: quiz.courseSlug } });
    if (!owner) continue;

    const lesson = await prisma.lesson.findUnique({
      where: { courseId_position: { courseId: owner.id, position: quiz.position } }
    });
    if (!lesson) continue;

    const record = await prisma.quiz.upsert({
      where: { lessonId: lesson.id },
      update: { title: quiz.title, passScore: quiz.passScore },
      create: {
        lessonId: lesson.id,
        title: quiz.title,
        passScore: quiz.passScore
      }
    });

    await prisma.question.deleteMany({ where: { quizId: record.id } });
    await prisma.question.createMany({
      data: quiz.questions.map((question, index) => ({
        quizId: record.id,
        text: question.text,
        options: question.options,
        correct: question.correct,
        position: index + 1
      }))
    });
    quizzesCreated += 1;
  }

  console.log("Seed tayyor:");
  console.log(`  admin: admin@uzdf.pro / ${adminPassword}`);
  console.log(`  pilot: pilot@uzdf.pro / ${pilotPassword}`);
  console.log(`  zonalar: 3 ta, kurs: ${course.title} (${lessons.length} dars)`);
  console.log(`  kurs 2: ${havoHuquqi.title} (${havoHuquqiLessons.length} dars)`);
  console.log(`  yangiliklar: ${newsItems.length} ta`);
  console.log(`  do'kon: ${products.length} ta mahsulot`);
  console.log(`  testlar: ${quizzesCreated} ta quiz`);
  console.log(`  pilot id: ${pilot.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
