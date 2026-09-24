import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 text-[#04121f] font-bold shadow-[0_18px_45px_-18px_rgba(52,211,153,0.75)] hover:shadow-[0_22px_55px_-16px_rgba(52,211,153,0.95)] hover:brightness-[1.06] active:brightness-95",
  secondary:
    "border border-white/12 bg-white/[0.05] text-neutral-100 backdrop-blur-md hover:border-emerald-400/45 hover:bg-white/[0.09]",
  ghost: "text-neutral-300 hover:bg-white/5 hover:text-white",
  danger:
    "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200",
  success:
    "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export function buttonClasses(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  const { variant = "primary", size = "md", className } = options ?? {};
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 outline-none",
    "focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
