import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-white/[0.06]", className)}
      aria-hidden="true"
    />
  );
}
