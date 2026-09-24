import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  /** gradient hoshiya */
  border?: boolean;
  /** yuqoridan yorug'lik (mesh) effekti */
  mesh?: boolean;
}

export default function Card({
  children,
  className,
  glow,
  hover,
  border,
  mesh,
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/[0.09]",
        "bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent",
        "backdrop-blur-xl",
        hover && "card-hover",
        glow && "ring-glow",
        border && "gradient-border",
        mesh && "mesh-card",
        className
      )}
    >
      {children}
    </div>
  );
}
