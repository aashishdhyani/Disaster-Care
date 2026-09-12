"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import {
  LayoutDashboard,
  Siren,
  Users,
  HeartHandshake,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sos", label: "SOS", icon: Siren },
  { href: "/contact", label: "Contacts", icon: Users },
  { href: "/donation", label: "Donations", icon: HeartHandshake },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes. Derived during render
  // (React's recommended pattern for "adjusting state on prop change")
  // rather than via a useEffect, so it doesn't trigger an extra render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-bold text-slate-900 focus-ring dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm shadow-brand-600/30">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <span className="hidden text-base tracking-tight sm:inline">
            Disaster<span className="text-brand-600 dark:text-brand-400">Care</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-ring",
                  active
                    ? "text-brand-700 dark:text-brand-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sos"
            className="hidden items-center gap-1.5 rounded-xl bg-emergency-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emergency-600/30 transition-all duration-200 hover:bg-emergency-700 active:scale-[0.97] sm:inline-flex focus-ring"
          >
            <Siren className="h-4 w-4" />
            SOS
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-ring md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <MobileMenu items={NAV_ITEMS} open={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}
