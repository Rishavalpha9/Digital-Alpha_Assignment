import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  children: ReactNode;
};

export function Card({ as: Component = "section", className, children, ...props }: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
