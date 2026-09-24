import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "sky" | "emerald" | "amber" | "red" | "violet" | "neutral";

const TONES: Record<BadgeTone, string> = {
  sky: "border-sky-400/35 bg-sky-400/10 text-sky-300",
  emerald: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/35 bg-amber-400/10 text-amber-300",
  red: "border-red-400/35 bg-red-400/10 text-red-300",
  violet: "border-violet-400/35 bg-violet-400/10 text-violet-300",
  neutral: "border-white/12 bg-white/[0.05] text-neutral-300",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
