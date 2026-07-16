"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CircleAlert,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
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

export type Screen =
  | "home"
  | "plan"
  | "summary"
  | "todo"
  | "contacts"
  | "places"
  | "pdf"
  | "alerts"
  | "issues"
  | "destinations"
  | "explore"
  | "booking";

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

// the trip's legs · tappable jump points into the itinerary
const LEGS = [
  { label: "Lima", dates: "Jul 23", dayIdx: 0 },
  { label: "Cusco", dates: "Jul 26", dayIdx: 3 },
  { label: "Machu Picchu", dates: "Jul 30", dayIdx: 7 },
  { label: "Cusco", dates: "Aug 1", dayIdx: 9 },
  { label: "La Paz", dates: "Aug 3", dayIdx: 11 },
  { label: "Uyuni", dates: "Aug 5", dayIdx: 13 },
  { label: "La Paz", dates: "Aug 7", dayIdx: 15 },
];

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
        dayIdx: i,
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
    if (stay) return { title: stay.title, dayIdx: i };
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

/** Current leg for highlighting the route strip. */
function currentLeg(todayIdx: number): number {
  let cur = 0;
  LEGS.forEach((leg, i) => {
    if (leg.dayIdx <= todayIdx) cur = i;
  });
  return cur;
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
      className="flex min-w-[68px] flex-col items-center gap-1.5 rounded-xl border border-sand-200/80 bg-card px-2.5 py-2.5 text-ink-soft shadow-card active:bg-sand-100"
    >
      <Icon size={16} strokeWidth={1.75} className="text-clay-500" aria-hidden />
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  );
}

export default function Overview({
  view,
  onNavigate,
  onTodaysPlan,
  onOpenDay,
}: {
  view: View;
  onNavigate: (s: Screen) => void;
  onTodaysPlan: () => void;
  onOpenDay: (dayIdx: number) => void;
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

  if (!now) return <div className="h-full" aria-hidden />;

  const phase = tripPhase(now);
  const WIcon = snapshot ? weatherIcon[snapshot.icon] ?? Cloud : null;
  const transit = nextTransit(idx);
  const stay = tonightStay(idx);
  const flag = phase === "during" ? dayFlag(today) : null;
  const leg = currentLeg(idx);
  const dateLine = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    // fills the locked viewport slot under the header exactly · no page scroll
    <div className="flex h-full flex-col justify-between gap-4 text-center">
      <div>
        {/* greeting · quiet and small */}
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

        {/* hero status block */}
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay-500">
          {dateLine}
        </p>
        <h1 className="mt-2 text-[38px] font-bold leading-none tracking-tight text-ink">
          {phase === "before" && `T-minus ${daysUntilDeparture(now)} day${daysUntilDeparture(now) === 1 ? "" : "s"}`}
          {phase === "during" && `Day ${today.index} of ${trip.days.length}`}
          {phase === "after" && "Welcome home"}
        </h1>
        <p className="mt-2 text-[15.5px] font-medium text-ink-soft">
          {phase === "before" ? `Departure ${shortDate(trip.start)} · ${trip.days[0].route}` : today.title}
        </p>

        <div className="mx-auto mt-3.5 h-px w-10 bg-clay-400" aria-hidden />

        {/* weather inline · cached first, refreshed in the background */}
        {snapshot && WIcon && (
          <div className="mt-3.5">
            <p className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink-soft">
              <WIcon size={15} strokeWidth={1.75} className="text-clay-500" aria-hidden />
              {snapshot.locationName} · {snapshot.tempC}° / {snapshot.tempF}°F · {snapshot.condition}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              H {snapshot.hiC}° L {snapshot.loC}°
              {stale && (
                <span> · as of {relativeTime(snapshot.fetchedAt)}{offline ? " · offline" : ""}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* at a glance · tiles open the matching day */}
      <div className="grid grid-cols-2 gap-2.5">
        {transit && (
          <button
            type="button"
            onClick={() => onOpenDay(transit.dayIdx)}
            className="rounded-xl border border-sand-200/80 bg-card px-3 py-3 shadow-card active:bg-sand-100"
          >
            {transit.kind === "flight" ? (
              <Plane size={15} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            ) : (
              <TrainFront size={15} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            )}
            <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Next {transit.kind}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{transit.when}</p>
          </button>
        )}
        {stay && (
          <button
            type="button"
            onClick={() => onOpenDay(stay.dayIdx)}
            className="rounded-xl border border-sand-200/80 bg-card px-3 py-3 shadow-card active:bg-sand-100"
          >
            <BedDouble size={15} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
            <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              {phase === "before" ? "First stay" : "Tonight"}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-ink">{stay.title}</p>
          </button>
        )}
        {flag && (
          <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-gold-400/40 bg-gold-100/40 px-3 py-2 dark:border-gold-400/25 dark:bg-gold-400/10">
            <flag.icon size={14} strokeWidth={1.75} className="text-gold-600 dark:text-gold-400" aria-hidden />
            <p className="text-[12px] font-medium text-ink-soft">{flag.text}</p>
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

      {/* the route · tappable legs */}
      <div>
        <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          The route
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {LEGS.map((l, i) => (
            <button
              key={`${l.label}-${l.dates}`}
              type="button"
              onClick={() => onOpenDay(l.dayIdx)}
              className={`rounded-lg border px-2.5 py-1.5 transition-colors ${
                phase === "during" && i === leg
                  ? "border-clay-600 bg-clay-600 text-white"
                  : "border-sand-200 bg-card text-ink-soft active:bg-sand-100"
              }`}
            >
              <span className="block text-[11.5px] font-semibold leading-tight">{l.label}</span>
              <span className={`block text-[9px] font-medium ${phase === "during" && i === leg ? "text-white/75" : "text-ink-faint"}`}>
                {l.dates}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {/* quick links */}
        <div className="flex flex-wrap justify-center gap-2">
          <QuickLink icon={CalendarDays} label="All Days" onClick={() => onNavigate("plan")} />
          <QuickLink icon={Compass} label="Explore" onClick={() => onNavigate("destinations")} />
          {view === "lead" && (
            <QuickLink icon={NotebookText} label="Bookings" onClick={() => onNavigate("summary")} />
          )}
          {view === "lead" && (
            <QuickLink icon={ListChecks} label="To Confirm" onClick={() => onNavigate("todo")} />
          )}
          {view === "lead" && (
            <QuickLink icon={CircleAlert} label="Issues" onClick={() => onNavigate("issues")} />
          )}
          <QuickLink icon={Phone} label="Emergency" onClick={() => onNavigate("contacts")} />
          <QuickLink icon={MapPin} label="Map Pins" onClick={() => onNavigate("places")} />
          <QuickLink icon={FileText} label="Full PDF" onClick={() => onNavigate("pdf")} />
        </div>

        {phase !== "after" && (
          <p className="mx-auto mt-3 max-w-sm text-[10.5px] leading-snug text-ink-faint">
            Before we lose signal: in Google Maps, download offline areas for
            Lima, Cusco, Aguas Calientes, La Paz and Uyuni.
          </p>
        )}
      </div>
    </div>
  );
}
