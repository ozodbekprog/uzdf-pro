import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AlertProps {
  tone?: "error" | "success" | "info" | "warning";
  children: ReactNode;
  className?: string;
}

const TONES = {
  error: "border-red-500/40 bg-red-500/10 text-red-200",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
};

export default function Alert({ tone = "info", children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm backdrop-blur-sm",
        TONES[tone],
        className
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
