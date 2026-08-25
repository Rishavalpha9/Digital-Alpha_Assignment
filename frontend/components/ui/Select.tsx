import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly Option[] | Option[];
};

export function Select({ label, options, id, className, ...props }: SelectProps) {
  const selectId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();

  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm" htmlFor={selectId}>
      <span className="font-medium text-ink">{label}</span>
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-xl border border-line bg-paper px-3 text-ink outline-none transition focus:border-gold focus-visible:ring-2 focus-visible:ring-gold",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
