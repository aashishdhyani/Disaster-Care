import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && (
          <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {icon}
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
