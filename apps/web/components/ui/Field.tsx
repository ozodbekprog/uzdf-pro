import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const FIELD =
  "w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium text-neutral-300">{label}</span>
      {children}
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(FIELD, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}
