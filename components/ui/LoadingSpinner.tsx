import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

export default function LoadingSpinner({
  label,
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-brand-500", sizeMap[size])} />
      {label && <span className="text-sm font-medium">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
