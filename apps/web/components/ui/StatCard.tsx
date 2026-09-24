import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "sky" | "emerald" | "amber" | "violet" | "red";
  className?: string;
  icon?: ReactNode;
}

const ACCENTS = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
  red: "text-red-400",
} as const;

const GLOWS = {
  sky: "from-sky-500/[0.14]",
  emerald: "from-emerald-500/[0.16]",
  amber: "from-amber-500/[0.14]",
  violet: "from-violet-500/[0.14]",
  red: "from-red-500/[0.14]",
} as const;

export default function StatCard({
  label,
  value,
  hint,
  accent = "sky",
  className,
  icon,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/[0.09] p-5",
        "bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent backdrop-blur-xl",
        "card-hover",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-gradient-to-b to-transparent blur-2xl",
          GLOWS[accent]
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          {label}
        </p>
        {icon ? <span className={cn("shrink-0", ACCENTS[accent])}>{icon}</span> : null}
      </div>
      <p
        className={cn(
          "relative mt-3 font-display text-3xl font-extrabold tracking-tight",
          ACCENTS[accent]
        )}
      >
        {value}
      </p>
      {hint ? <p className="relative mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
