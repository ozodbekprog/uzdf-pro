import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Toaster } from "sonner";
import Chrome from "@/components/Chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DRONCHI — Dron texnologiyalariga olib boruvchi yagona platforma",
  description:
    "O'zbekistondagi yagona aviatsiya ekotizimi: online o'quv dasturi, milliy simulyator, poligonlar xaritasi, maxsus dronlar va soha yangiliklari.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          // Mavzuni birinchi bo'yashdan oldin qo'llaymiz (miltillash bo'lmasligi uchun)
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('dronchi-theme');if(m==='light'){document.documentElement.classList.add('light')}}catch(e){}",
          }}
        />
        <div className="aurora" aria-hidden="true" />
        <div className="grid-overlay" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <Chrome>
          <div className="flex flex-1 flex-col">{children}</div>
        </Chrome>
        <Toaster position="bottom-center" richColors theme="dark" />
      </body>
    </html>
  );
}
