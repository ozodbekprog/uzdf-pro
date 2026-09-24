import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "sky" | "emerald" | "amber" | "red" | "violet" | "neutral";

const TONES: Record<BadgeTone, string> = {
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-300 light:text-sky-700 light:border-sky-600/30",
  emerald:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 light:text-emerald-700 light:border-emerald-600/30",
  amber:
    "border-amber-500/40 bg-amber-500/10 text-amber-300 light:text-amber-700 light:border-amber-600/30",
  red: "border-red-500/40 bg-red-500/10 text-red-300 light:text-red-700 light:border-red-600/30",
  violet:
    "border-violet-500/40 bg-violet-500/10 text-violet-300 light:text-violet-700 light:border-violet-600/30",
  neutral: "border-line bg-surface text-muted",
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
