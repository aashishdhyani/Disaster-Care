import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  tone?: "brand" | "emergency" | "success" | "warning";
  className?: string;
}

const toneClasses: Record<NonNullable<EmergencyCardProps["tone"]>, string> = {
  brand:
    "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white",
  emergency:
    "bg-emergency-50 text-emergency-600 dark:bg-emergency-500/10 dark:text-emergency-400 group-hover:bg-emergency-600 group-hover:text-white",
  success:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",
};

export default function EmergencyCard({
  href,
  title,
  description,
  icon,
  tone = "brand",
  className,
}: EmergencyCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group surface-card relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm shadow-slate-900/[0.03] transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/[0.08] dark:bg-slate-900/60 dark:border-slate-800 dark:hover:shadow-black/30",
        "focus-ring",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300",
            toneClasses[tone]
          )}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
