import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "sky" | "emerald" | "amber" | "red" | "violet" | "neutral";

const TONES: Record<BadgeTone, string> = {
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  red: "border-red-500/40 bg-red-500/10 text-red-300",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  neutral: "border-white/10 bg-white/5 text-neutral-300",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
