"use client";

import { useEffect, useState } from "react";
import { trip } from "@/data/trip";
import { greetingLine } from "@/lib/greeting";
import { OFFLINE_AREAS } from "@/lib/maps";
import { useName } from "@/lib/useName";
import { daysUntilDeparture, todayIndex, tripPhase } from "@/lib/useToday";
import NamePicker from "./NamePicker";
import WeatherChip from "./WeatherChip";

export default function HomeGreeting({
  onJumpToToday,
}: {
  onJumpToToday: () => void;
}) {
  const [name, setName] = useName();
  const [picking, setPicking] = useState(false);
  // `now` drives greeting + trip-day math; re-evaluated on mount and when the
  // tab regains focus — everything is derived on-device, no polling, no network.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!now) {
    // Pre-mount placeholder keeps SSR/static markup stable (no clock on the server).
    return <section className="mb-6 min-h-[120px]" aria-hidden />;
  }

  const phase = tripPhase(now);
  const today = trip.days[todayIndex(now)];
  const showPicker = picking || !name;

  return (
    <section
      aria-label="Welcome"
      className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-clay-500 via-clay-400 to-gold-400 p-[1.5px] shadow-hero"
    >
      <div className="rounded-[calc(1.5rem-1.5px)] bg-sand-50/95 px-5 pb-5 pt-6">
        {/* subtle andean horizon motif */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-1 h-24 w-44 text-clay-500/[0.08]"
          viewBox="0 0 176 96"
          fill="currentColor"
        >
          <path d="M0 96 L44 28 L70 62 L104 8 L140 56 L176 20 L176 96 Z" />
          <circle cx="30" cy="18" r="12" className="text-gold-400/30" fill="currentColor" />
        </svg>

        <h1 className="relative font-display text-[30px] font-semibold leading-tight tracking-tight text-ink">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="text-left"
            title="Tap to change who's greeted"
          >
            {greetingLine(name, now)}
          </button>
        </h1>

        {name && !picking && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="mt-0.5 text-[12px] text-ink-faint underline decoration-sand-300 underline-offset-2"
          >
            not you?
          </button>
        )}

        {showPicker && (
          <div className="mt-3">
            <NamePicker
              onPick={(n) => {
                setName(n);
                setPicking(false);
              }}
            />
          </div>
        )}

        {/* at a glance — all computed on-device */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-andes-600 px-3.5 py-1.5 text-[13px] font-bold text-sand-50">
            {phase === "before" && (
              <>🛫 T-minus {daysUntilDeparture(now)} day{daysUntilDeparture(now) === 1 ? "" : "s"}</>
            )}
            {phase === "during" && (
              <>🏔️ Day {today.index} of {trip.days.length} — {today.route}</>
            )}
            {phase === "after" && <>Welcome home 🎉</>}
          </span>
          <button
            type="button"
            onClick={onJumpToToday}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-clay-300 bg-white px-3.5 py-1.5 text-[13px] font-bold text-clay-600 shadow-sm active:bg-clay-50"
          >
            Jump to today ↓
          </button>
        </div>

        <WeatherChip coords={today.coords} />

        {phase !== "after" && (
          <p className="mt-3 text-[11.5px] leading-snug text-ink-faint">
            📶 Before we lose signal: Google Maps → profile → Offline maps →
            download {OFFLINE_AREAS.join(", ")}.
          </p>
        )}
      </div>
    </section>
  );
}
