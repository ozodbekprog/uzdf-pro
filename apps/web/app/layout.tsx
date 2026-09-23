import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "DRONCHI — Dron texnologiyalariga olib boruvchi yagona platforma",
  description:
    "O'zbekistondagi yagona aviatsiya ekotizimi: online o'quv dasturi, milliy simulyator, poligonlar xaritasi, maxsus dronlar va soha yangiliklari.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <Chrome>
          <div className="flex flex-1 flex-col">{children}</div>
        </Chrome>
        <Toaster position="bottom-center" richColors theme="dark" />
      </body>
    </html>
  );
}
