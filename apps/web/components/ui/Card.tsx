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
        "glass relative rounded-3xl",
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
