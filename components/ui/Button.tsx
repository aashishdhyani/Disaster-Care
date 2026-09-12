import Link from "next/link";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "glass";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-700",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
  danger:
    "bg-emergency-600 text-white shadow-sm shadow-emergency-600/30 hover:bg-emergency-700 active:bg-emergency-700",
  outline:
    "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  glass:
    "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-6 py-3.5 gap-2.5 rounded-2xl",
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-all duration-200 select-none " +
  "disabled:opacity-50 disabled:pointer-events-none focus-ring " +
  "active:scale-[0.97]";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
  external?: boolean;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    icon,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  if ("href" in rest && rest.href) {
    const { href, external } = rest as ButtonAsLink;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {icon}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon}
      {children}
    </button>
  );
}
