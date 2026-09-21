import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-neutral-200">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-neutral-500">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonClasses({ size: "sm" })}>
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
