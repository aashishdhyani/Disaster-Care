"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  UserPlus,
  Phone,
  Mail,
  User,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useUserId } from "@/lib/useUserId";

interface ContactRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

type FetchState = "idle" | "loading" | "error" | "loaded";

export default function ContactPage() {
  const userId = useUserId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  const loadContacts = useCallback(async (id: string) => {
    setFetchState("loading");
    try {
      const res = await fetch(`/api/contact?userId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts ?? []);
        setFetchState("loaded");
      } else {
        setFetchState("error");
      }
    } catch (error) {
      console.error(error);
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    if (userId) loadContacts(userId);
  }, [userId, loadContacts]);

  const addContact = async () => {
    if (!name || !phone || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, phone, email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Emergency contact added");
        setName("");
        setPhone("");
        setEmail("");
        loadContacts(userId);
      } else {
        toast.error(data.error || "Could not add contact");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SectionHeader
        eyebrow="Emergency Contacts"
        icon={<Users className="h-3.5 w-3.5" />}
        title="Who should we alert?"
        description="Everyone on this list receives an SMS and email with your live location the moment you trigger an SOS."
        className="animate-fade-in-up"
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="p-6 animate-fade-in-up lg:col-span-2" style={{ animationDelay: "80ms" }}>
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <UserPlus className="h-4.5 w-4.5" />
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Add a contact
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <Field
              label="Full name"
              icon={<User className="h-4 w-4" />}
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={setName}
            />
            <Field
              label="Phone number"
              icon={<Phone className="h-4 w-4" />}
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={setPhone}
              type="tel"
            />
            <Field
              label="Email address"
              icon={<Mail className="h-4 w-4" />}
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={setEmail}
              type="email"
            />

            <Button
              onClick={addContact}
              disabled={submitting}
              fullWidth
              size="lg"
              icon={
                submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )
              }
            >
              {submitting ? "Adding…" : "Add Contact"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Users className="h-4 w-4 text-slate-400" />
            Your emergency contacts
            {fetchState === "loaded" && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {contacts.length}
              </span>
            )}
          </h3>

          {fetchState === "loading" && (
            <Card className="p-8">
              <LoadingSpinner label="Loading your contacts…" />
            </Card>
          )}

          {fetchState === "error" && (
            <EmptyState
              tone="error"
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Couldn't load contacts"
              description="There was a problem reaching the server. Please try again."
              action={
                <Button variant="outline" size="sm" onClick={() => loadContacts(userId)}>
                  Retry
                </Button>
              }
            />
          )}

          {fetchState === "loaded" && contacts.length === 0 && (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No emergency contacts yet"
              description="Add at least one contact so SOS alerts have somewhere to go."
            />
          )}

          {fetchState === "loaded" && contacts.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.map((c) => (
                <Card key={c._id} hover className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      {c.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="h-3 w-3 shrink-0" /> {c.phone}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="h-3 w-3 shrink-0" /> {c.email}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </div>
    </label>
  );
}
