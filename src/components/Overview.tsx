"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  FileText,
  ListChecks,
  MapPin,
  NotebookText,
  Phone,
  Plane,
  ShieldAlert,
  Sun,
  Thermometer,
  TrainFront,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { trip } from "@/data/trip";
import { greetingFor, greetingLine } from "@/lib/greeting";
import { useName } from "@/lib/useName";
import { daysUntilDeparture, localISO, todayIndex, tripPhase } from "@/lib/useToday";
import { relativeTime, useWeather } from "@/lib/useWeather";
import type { View } from "@/lib/useView";
import type { Day } from "@/types";
import NamePicker from "./NamePicker";

export type Screen = "home" | "plan" | "summary" | "todo" | "contacts" | "places" | "pdf";

const weatherIcon: Record<string, LucideIcon> = {
  sun: Sun,
  "sun-cloud": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  thermometer: Thermometer,
};

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** First upcoming flight/train from today onward, for the transit tile. */
function nextTransit(fromIdx: number) {
  for (let i = fromIdx; i < trip.days.length; i++) {
    const card = trip.days[i].cards.find((c) => c.kind === "flight" || c.kind === "train");
    if (card) {
      const time = card.lines.join(" ").match(/\b\d{1,2}:\d{2}\s?[AP]M\b/)?.[0];
      return {
        kind: card.kind as "flight" | "train",
        title: card.title,
        when: `${shortDate(trip.days[i].date)}${time ? ` · ${time}` : ""}`,
      };
    }
  }
  return null;
}

/** Most recent stay on or before today · where the family sleeps tonight. */
function tonightStay(fromIdx: number) {
  for (let i = fromIdx; i >= 0; i--) {
    const stay = trip.days[i].cards.find((c) => c.kind === "stay" && c.status !== "gap");
    if (stay) return stay.title;
  }
  return null;
}

/** Cash-due / passport flag for a given day, if any. */
function dayFlag(day: Day): { icon: LucideIcon; text: string } | null {
  const all = [day.warn ?? "", ...day.cards.flatMap((c) => [...c.lines, c.leadNote ?? ""])].join(" ");
  if (/passport/i.test(all)) return { icon: ShieldAlert, text: "Original passports required today" };
  const cash = all.match(/\$(\d+)\s?(?:USD\s?)?[^.]*due on site/i);
  if (cash) return { icon: Wallet, text: `Cash due on site today: $${cash[1]}` };
  return null;
}

function QuickLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[72px] flex-col items-center gap-1.5 rounded-xl border border-sand-200/80 bg-white px-3 py-3 text-ink-soft shadow-card active:bg-sand-100"
    >
      <Icon size={17} strokeWidth={1.75} className="text-clay-500" aria-hidden />
      <span className="text-[10.5px] font-medium tracking-tight">{label}</span>
    </button>
  );
}

export default function Overview({
  view,
  onNavigate,
  onTodaysPlan,
}: {
  view: View;
  onNavigate: (s: Screen) => void;
  onTodaysPlan: () => void;
}) {
  const [name, setName] = useName();
  const [picking, setPicking] = useState(false);
  // re-evaluated on mount and when the tab regains focus · on-device only
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      // skip the re-render when nothing user-visible would change
      setNow((prev) => {
        const next = new Date();
        return prev && localISO(prev) === localISO(next) && greetingFor(prev) === greetingFor(next)
          ? prev
          : next;
      });
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const idx = now ? todayIndex(now) : 0;
  const today = trip.days[idx];
  const { snapshot, stale, offline } = useWeather(today.coords);

  if (!now) return <div className="min-h-[60vh]" aria-hidden />;

  const phase = tripPhase(now);
  const WIcon = snapshot ? weatherIcon[snapshot.icon] ?? Cloud : null;
  const transit = nextTransit(idx);
  const stay = tonightStay(idx);
  const flag = phase === "during" ? dayFlag(today) : null;
  const dateLine = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 text-center">
      {/* greeting · quiet and small */}
      <div>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="text-[13px] font-medium text-ink-faint"
          title="Tap to change who's greeted"
        >
          {greetingLine(name, now)}
        </button>
        {(picking || !name) && (
          <div className="mt-2">
            <NamePicker
              onPick={(n) => {
                setName(n);
                setPicking(false);
              }}
            />
          </div>
        )}
      </div>

      {/* hero status block */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay-500">
          {dateLine}
        </p>
        <h1 className="mt-2 text-[40px] font-bold leading-none tracking-tight text-ink">
          {phase === "before" && `T-minus ${daysUntilDeparture(now)} day${daysUntilDeparture(now) === 1 ? "" : "s"}`}
          {phase === "during" && `Day ${today.index} of ${trip.days.length}`}
          {phase === "after" && "Welcome home"}
        </h1>
        <p className="mt-2 text-[16px] font-medium text-ink-soft">
          {phase === "before" ? `Departure ${shortDate(trip.start)} · ${trip.days[0].route}` : today.title}
        </p>

        <div className="mx-auto mt-4 h-px w-10 bg-clay-400" aria-hidden />

        {/* weather inline · cached first, refreshed in the background */}
        {snapshot && WIcon && (
          <div className="mt-4">
            <p className="flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-ink-soft">
              <WIcon size={16} strokeWidth={1.75} className="text-clay-500" aria-hidden />
              {snapshot.locationName} · {snapshot.tempC}° / {snapshot.tempF}°F · {snapshot.condition}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-faint">
              H {snapshot.hiC}° L {snapshot.loC}°
              {stale && (
                <span> · as of {relativeTime(snapshot.fetchedAt)}{offline ? " · offline" : ""}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* at a glance */}
      <div className="grid grid-cols-2 gap-2.5">
        {transit && (
          <div className="rounded-xl border border-sand-200/80 bg-white px-3 py-3.5 shadow-card">
            {transit.kind === "flight" ? (
              <Plane size={16} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            ) : (
              <TrainFront size={16} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            )}
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Next {transit.kind}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{transit.when}</p>
          </div>
        )}
        {stay && (
          <div className="rounded-xl border border-sand-200/80 bg-white px-3 py-3.5 shadow-card">
            <BedDouble size={16} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              {phase === "before" ? "First stay" : "Tonight"}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-ink">{stay}</p>
          </div>
        )}
        {flag && (
          <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-gold-400/40 bg-gold-100/40 px-3 py-2.5">
            <flag.icon size={15} strokeWidth={1.75} className="text-gold-600" aria-hidden />
            <p className="text-[12.5px] font-medium text-ink-soft">{flag.text}</p>
          </div>
        )}
      </div>

      {/* primary action */}
      <button
        type="button"
        onClick={onTodaysPlan}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-clay-600 text-[15px] font-semibold text-white shadow-lift active:bg-clay-700"
      >
        Today's Plan
        <ArrowRight size={17} strokeWidth={2} aria-hidden />
      </button>

      {/* quick links */}
      <div className="flex flex-wrap justify-center gap-2">
        <QuickLink icon={CalendarDays} label="All Days" onClick={() => onNavigate("plan")} />
        {view === "lead" && (
          <QuickLink icon={NotebookText} label="Bookings" onClick={() => onNavigate("summary")} />
        )}
        {view === "lead" && (
          <QuickLink icon={ListChecks} label="To Confirm" onClick={() => onNavigate("todo")} />
        )}
        <QuickLink icon={Phone} label="Emergency" onClick={() => onNavigate("contacts")} />
        <QuickLink icon={MapPin} label="Map Pins" onClick={() => onNavigate("places")} />
        <QuickLink icon={FileText} label="Full PDF" onClick={() => onNavigate("pdf")} />
      </div>
    </div>
  );
}
