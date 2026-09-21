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
    update: { published: true },
    create: {
      slug: "fpv-asoslari",
      title: "FPV asoslari",
      description: "Noldan birinchi parvozgacha: qurilma, qoidalar va amaliyot",
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
    update: { published: true },
    create: {
      slug: "havo-huquqi",
      title: "Havo huquqi va xavfsizlik",
      description: "O'zbekistonda BPLA bo'yicha huquqiy asoslar",
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

  console.log("Seed tayyor:");
  console.log(`  admin: admin@uzdf.pro / ${adminPassword}`);
  console.log(`  pilot: pilot@uzdf.pro / ${pilotPassword}`);
  console.log(`  zonalar: 3 ta, kurs: ${course.title} (${lessons.length} dars)`);
  console.log(`  kurs 2: ${havoHuquqi.title} (${havoHuquqiLessons.length} dars)`);
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
