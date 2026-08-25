import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();

  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm" htmlFor={inputId}>
      <span className="font-medium text-ink">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-line bg-paper px-3 text-ink shadow-inner outline-none transition focus:border-gold focus-visible:ring-2 focus-visible:ring-gold",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
