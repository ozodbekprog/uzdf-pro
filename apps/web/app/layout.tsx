import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import NavBar from "@/components/NavBar";
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
  title: "UZDF Pro — BPLA uchuvchilari platformasi",
  description:
    "Geozonalar, akademiya va pilot profili: O'zbekiston BPLA uchuvchilari uchun yagona platforma.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <NavBar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Toaster position="bottom-center" richColors theme="dark" />
      </body>
    </html>
  );
}
