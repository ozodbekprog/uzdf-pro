import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export default function Card({ children, className, glow, hover }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm",
        glow && "shadow-[0_0_40px_-12px] shadow-sky-500/30",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-white/[0.05]",
        className
      )}
    >
      {children}
    </div>
  );
}
