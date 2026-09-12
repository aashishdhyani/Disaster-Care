import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  glass = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm shadow-slate-900/[0.03] transition-all duration-300",
        glass
          ? "glass-panel"
          : "surface-card dark:bg-slate-900/60 dark:border-slate-800",
        hover &&
          "hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/[0.08] dark:hover:shadow-black/30",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
