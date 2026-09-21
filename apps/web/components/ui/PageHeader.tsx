import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-5",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-neutral-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
