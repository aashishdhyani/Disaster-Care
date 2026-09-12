import { type ReactNode } from "react";
import Card from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "brand" | "emergency" | "success" | "warning" | "neutral";
  className?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  emergency:
    "bg-emergency-50 text-emergency-600 dark:bg-emergency-500/10 dark:text-emergency-400",
  success:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  neutral:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  className,
}: StatCardProps) {
  return (
    <Card hover className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              toneClasses[tone]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
