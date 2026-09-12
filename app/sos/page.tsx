"use client";

import { useState } from "react";
import {
  Siren,
  MapPin,
  CheckCircle2,
  XCircle,
  LocateFixed,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUserId } from "@/lib/useUserId";

type SosState =
  | "idle"
  | "locating"
  | "sending"
  | "success"
  | "error"
  | "permission-denied";

export default function SOS() {
  const [state, setState] = useState<SosState>("idle");
  const userId = useUserId();
  const [errorMessage, setErrorMessage] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const busy = state === "locating" || state === "sending";

  const handleSOS = () => {
    if (busy) return;

    if (!navigator.geolocation) {
      setState("error");
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    if (!userId) {
      setState("error");
      setErrorMessage("User not ready yet — please try again in a moment.");
      return;
    }

    setState("locating");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setState("sending");

        try {
          const res = await fetch("/api/sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              lat: latitude,
              lng: longitude,
            }),
          });

          const data = await res.json();

          if (data.success) {
            setState("success");
          } else {
            setState("error");
            setErrorMessage(data.error || "The SOS could not be sent.");
          }
        } catch (error) {
          console.error(error);
          setState("error");
          setErrorMessage("Network error — please check your connection.");
        }
      },
      (err) => {
        console.log("LOCATION ERROR:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setState("permission-denied");
        } else {
          setState("error");
          setErrorMessage(err.message || "Could not determine your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reset = () => {
    setState("idle");
    setErrorMessage("");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-14 text-center sm:px-6">
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emergency-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emergency-600 animate-fade-in dark:bg-emergency-500/10 dark:text-emergency-400">
        <ShieldAlert className="h-3.5 w-3.5" />
        Emergency Response
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl animate-fade-in-up dark:text-white">
        Need help right now?
      </h1>
      <p
        className="mt-3 max-w-md text-slate-500 animate-fade-in-up dark:text-slate-400"
        style={{ animationDelay: "80ms" }}
      >
        Press the button below. We&apos;ll share your live location with your
        emergency contacts by SMS and email immediately.
      </p>

      <div
        className="relative my-10 flex items-center justify-center animate-scale-in"
        style={{ animationDelay: "140ms" }}
      >
        {state === "idle" && (
          <>
            <span className="absolute h-40 w-40 rounded-full bg-emergency-500/40 animate-sos-ping" />
            <span
              className="absolute h-40 w-40 rounded-full bg-emergency-500/30 animate-sos-ping"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        <button
          type="button"
          onClick={handleSOS}
          disabled={busy}
          aria-label="Send SOS emergency alert"
          className={cn(
            "relative flex h-40 w-40 flex-col items-center justify-center gap-1.5 rounded-full text-white shadow-xl transition-all duration-200 focus-ring active:scale-95 sm:h-48 sm:w-48",
            busy
              ? "bg-slate-400 cursor-wait"
              : "bg-gradient-to-br from-emergency-500 to-emergency-700 shadow-emergency-600/40 hover:shadow-2xl hover:shadow-emergency-600/50 hover:scale-[1.03]"
          )}
        >
          {busy ? (
            <Loader2 className="h-9 w-9 animate-spin" />
          ) : (
            <Siren className="h-9 w-9" />
          )}
          <span className="text-lg font-bold tracking-wide sm:text-xl">
            {state === "locating"
              ? "LOCATING…"
              : state === "sending"
                ? "SENDING…"
                : "SEND SOS"}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {state === "idle" && (
          <Card className="flex items-center justify-center gap-2 p-3.5 text-sm text-slate-500 dark:text-slate-400">
            <LocateFixed className="h-4 w-4 text-slate-400" />
            Location will be requested when you press SOS
          </Card>
        )}

        {state === "locating" && (
          <Card className="flex items-center justify-center gap-2 p-3.5 text-sm text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
            Getting your current location…
          </Card>
        )}

        {state === "sending" && (
          <Card className="flex items-center justify-center gap-2 p-3.5 text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-brand-500" />
            Location found{coords ? ` (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : ""}
            — alerting your contacts…
          </Card>
        )}

        {state === "success" && (
          <Card className="flex flex-col items-center gap-2 border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              SOS sent successfully
            </p>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
              Your emergency contacts have been notified with your location.
            </p>
            <Button variant="outline" size="sm" onClick={reset} className="mt-2">
              Send another alert
            </Button>
          </Card>
        )}

        {state === "permission-denied" && (
          <Card className="flex flex-col items-center gap-2 border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/30">
            <XCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Location access denied
            </p>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
              Enable location permissions for this site in your browser
              settings, then try again.
            </p>
            <Button variant="outline" size="sm" onClick={reset} className="mt-2">
              Try again
            </Button>
          </Card>
        )}

        {state === "error" && (
          <Card className="flex flex-col items-center gap-2 border-emergency-200 bg-emergency-50/70 p-5 dark:border-emergency-900 dark:bg-emergency-950/30">
            <XCircle className="h-8 w-8 text-emergency-600 dark:text-emergency-400" />
            <p className="font-semibold text-emergency-700 dark:text-emergency-400">
              Couldn&apos;t send SOS
            </p>
            <p className="text-sm text-emergency-700/80 dark:text-emergency-400/80">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <Button variant="outline" size="sm" onClick={reset} className="mt-2">
              Try again
            </Button>
          </Card>
        )}
      </div>

      <p className="mt-8 max-w-md text-xs text-slate-400 dark:text-slate-500">
        Make sure you&apos;ve added at least one emergency contact — SOS
        alerts are sent to the contacts on your{" "}
        <a href="/contact" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Emergency Contacts
        </a>{" "}
        list.
      </p>
    </div>
  );
}
