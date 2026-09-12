"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type NavItem } from "./Navbar";

interface MobileMenuProps {
  items: NavItem[];
  open: boolean;
  onNavigate: () => void;
}

export default function MobileMenu({ items, open, onNavigate }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="min-h-0">
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
