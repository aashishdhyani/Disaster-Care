"use client";

import { useMemo, useState } from "react";
import {
  Search,
  HeartHandshake,
  BadgeCheck,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import ngos from "@/data/ngos.json";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type NGO = {
  name: string;
  city: string;
  focus: string;
  website: string;
  donationUrl?: string;
  verified: boolean;
  source: string;
};

export default function DonationPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set((ngos as NGO[]).map((n) => n.focus));
    return ["all", ...Array.from(set)];
  }, []);

  const filteredNGOs = useMemo(() => {
    return (ngos as NGO[]).filter((ngo) => {
      const matchesSearch =
        ngo.name.toLowerCase().includes(search.toLowerCase()) ||
        ngo.city.toLowerCase().includes(search.toLowerCase()) ||
        ngo.focus.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || ngo.focus === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SectionHeader
        eyebrow="Disaster Relief & Donations"
        icon={<HeartHandshake className="h-3.5 w-3.5" />}
        title="Support verified relief organizations"
        description="Every donation goes directly through the NGO's own official website — we never process payments ourselves."
        className="animate-fade-in-up"
      />

      <div
        className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by NGO name, city, or cause…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus-ring",
              category === cat
                ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {cat === "all" ? "All causes" : cat}
          </button>
        ))}
      </div>

      <div
        className="mt-8 animate-fade-in-up"
        style={{ animationDelay: "140ms" }}
      >
        {filteredNGOs.length === 0 ? (
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            title="No NGOs match your search"
            description="Try a different name, city, or cause."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNGOs.map((ngo) => (
              <Card key={ngo.name} hover className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {ngo.name}
                  </h3>
                  {ngo.verified && (
                    <span
                      title={ngo.source ? `Verified via ${ngo.source}` : "Verified"}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {ngo.city}
                </p>

                <p className="mt-3 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {ngo.focus}
                </p>

                {ngo.source && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="h-3 w-3" />
                    Source: {ngo.source}
                  </p>
                )}

                <a
                  href={ngo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 active:scale-[0.97]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Official Website
                </a>
{ngo.donationUrl ? (
  <a
    href={ngo.donationUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl bg-red-600 px-4 py-2.5 text-center font-semibold text-white"
  >
    ❤️ Donate Now
  </a>
) : (
  <a
    href={ngo.website}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl border px-4 py-2.5 text-center"
  >
    🌐 Visit NGO Website
  </a>
)}

              </Card>
            ))}
          </div>
        )}
      </div>

<div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
  🔒 Donations are completed directly on the NGO's official website.
  Your payment information is not handled by this application.
</div>
    </div>
  );
}
