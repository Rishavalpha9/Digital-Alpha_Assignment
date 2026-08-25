import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = {
  tone?: "success" | "danger" | "warning" | "neutral";
  children: ReactNode;
};

const tones = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-paper text-muted",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
