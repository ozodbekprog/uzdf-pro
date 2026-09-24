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
  sky: "text-sky-400 light:text-sky-600",
  emerald: "text-emerald-400 light:text-emerald-600",
  amber: "text-amber-400 light:text-amber-600",
  violet: "text-violet-400 light:text-violet-600",
  red: "text-red-400 light:text-red-600",
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
    <div className={cn("glass card-hover relative overflow-hidden rounded-3xl p-5", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-gradient-to-b from-current to-transparent opacity-[0.14] blur-2xl",
          ACCENTS[accent]
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
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
      {hint ? <p className="relative mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
