import { cn } from "@/lib/cn";

export type ProgressTone = "sky" | "emerald" | "amber" | "violet";

const TONES: Record<ProgressTone, string> = {
  sky: "from-sky-500 to-cyan-400",
  emerald: "from-emerald-500 to-teal-400",
  amber: "from-amber-500 to-orange-400",
  violet: "from-violet-500 to-fuchsia-400",
};

interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  tone = "sky",
  className,
  showLabel,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", TONES[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <span className="w-10 text-right text-xs font-medium text-neutral-400">{clamped}%</span>
      ) : null}
    </div>
  );
}
