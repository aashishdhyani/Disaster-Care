"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Siren,
  Users,
  MapPinned,
  HeartHandshake,
  Radio,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";
import EmergencyCard from "@/components/ui/EmergencyCard";
import ngos from "@/data/ngos.json";
import { useUserId } from "@/lib/useUserId";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
      Loading live map…
    </div>
  ),
});

export default function Dashboard() {
  const userId = useUserId();
  const [contactCount, setContactCount] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/contact?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContactCount(data.contacts?.length ?? 0);
      })
      .catch(() => setContactCount(null));
  }, [userId]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 dark:border-slate-800">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-float"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emergency-500/10 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                <Radio className="h-3.5 w-3.5" />
                Emergency Command Center
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Stay prepared. Respond fast.
                <br />
                Help arrives faster together.
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/70">
                Trigger instant SOS alerts, manage who gets notified, find the
                nearest hospitals and shelters, and support verified disaster
                relief NGOs — all in one place.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/sos" variant="danger" size="lg" icon={<Siren className="h-5 w-5" />}>
                  Send SOS Now
                </Button>
                <Button
                  href="/donation"
                  variant="glass"
                  size="lg"
                  icon={<HeartHandshake className="h-5 w-5" />}
                >
                  Support Relief Efforts
                </Button>
              </div>
            </div>

            <Card
              glass
              className="w-full max-w-sm animate-fade-in-up border-white/15 bg-white/10 p-5 text-white lg:w-80"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <ShieldCheck className="h-4 w-4" />
                System status
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-lg font-semibold">All systems operational</span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                SOS alerts are delivered via SMS and email in real time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Your Contacts"
            value={contactCount === null ? "—" : contactCount}
            hint="Alerted on every SOS"
            icon={<Users className="h-5 w-5" />}
            tone="brand"
          />
          <StatCard
            label="Alert Channels"
            value="SMS + Email"
            hint="Fast2SMS & Nodemailer"
            icon={<Radio className="h-5 w-5" />}
            tone="warning"
          />
          <StatCard
            label="Map Coverage"
            value="8 km radius"
            hint="Hospitals, police, shelters"
            icon={<MapPinned className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="NGO Partners"
            value={ngos.length}
            hint="Verified via NGO Darpan"
            icon={<Building2 className="h-5 w-5" />}
            tone="emergency"
          />
        </section>

        {/* Quick actions */}
        <section>
          <SectionHeader
            eyebrow="Quick actions"
            icon={<ArrowRight className="h-3.5 w-3.5" />}
            title="What do you need to do?"
            description="Jump straight into the tool you need."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EmergencyCard
              href="/sos"
              tone="emergency"
              icon={<Siren className="h-5 w-5" />}
              title="Send SOS"
              description="Alert your emergency contacts with your live location."
            />
            <EmergencyCard
              href="/contact"
              tone="brand"
              icon={<Users className="h-5 w-5" />}
              title="Emergency Contacts"
              description="Add or review who gets notified during an SOS."
            />
            <EmergencyCard
              href="/"
              tone="success"
              icon={<MapPinned className="h-5 w-5" />}
              title="Live Map"
              description="Find nearby hospitals, police stations, and shelters."
            />
            <EmergencyCard
              href="/donation"
              tone="warning"
              icon={<HeartHandshake className="h-5 w-5" />}
              title="Donations"
              description="Support verified NGOs doing disaster relief work."
            />
          </div>
        </section>

        {/* Live map preview */}
        <section>
          <SectionHeader
            eyebrow="Nearby help"
            icon={<MapPinned className="h-3.5 w-3.5" />}
            title="Live emergency services map"
            description="Hospitals, police stations, and shelters within 8 km of your current location."
            action={
              <Link
                href="/donation"
                className="hidden text-sm font-medium text-brand-600 hover:underline sm:inline-flex dark:text-brand-400"
              >
                Explore relief NGOs →
              </Link>
            }
          />
          <div className="mt-6">
            <LiveMap />
          </div>
        </section>
      </div>
    </div>
  );
}
