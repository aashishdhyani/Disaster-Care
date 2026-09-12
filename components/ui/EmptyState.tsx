import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "error";
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center animate-fade-in",
        tone === "error"
          ? "border-emergency-300 bg-emergency-50/50 dark:border-emergency-900 dark:bg-emergency-950/20"
          : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            tone === "error"
              ? "bg-emergency-100 text-emergency-600 dark:bg-emergency-900/40 dark:text-emergency-400"
              : "bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
