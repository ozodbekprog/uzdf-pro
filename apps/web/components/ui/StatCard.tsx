import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "sky" | "emerald" | "amber" | "violet" | "red";
  className?: string;
}

const ACCENTS = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
  red: "text-red-400",
};

export default function StatCard({
  label,
  value,
  hint,
  accent = "sky",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight", ACCENTS[accent])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
