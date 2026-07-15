"use client";

import { useEffect, useRef, useState } from "react";
import ContactsPanel from "@/components/ContactsPanel";
import DayView from "@/components/DayView";
import HomeGreeting from "@/components/HomeGreeting";
import { SummaryPanel, TodoPanel } from "@/components/LeadPanels";
import { trip } from "@/data/trip";
import { todayIndex } from "@/lib/useToday";
import { useView, type View } from "@/lib/useView";

type Tab = "day" | "summary" | "todo" | "contacts";

export default function Page() {
  const [view, setView] = useView();
  const [tab, setTab] = useState<Tab>("day");
  // null until mount · today is resolved client-side to avoid hydration mismatch
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [todayIdx, setTodayIdx] = useState(0);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = todayIndex();
    setTodayIdx(t);
    setDayIdx(t);
  }, []);

  // keep the selected chip visible in the rail
  useEffect(() => {
    if (dayIdx === null) return;
    railRef.current
      ?.querySelector(`[data-day="${dayIdx}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [dayIdx]);

  const switchView = (v: View) => {
    setView(v);
    // lead-only tabs close when leaving Trip Lead; contacts stays · it's family-safe
    if (v === "family" && (tab === "summary" || tab === "todo")) setTab("day");
  };

  const jumpToToday = () => {
    const t = todayIndex();
    setTodayIdx(t);
    setDayIdx(t);
    setTab("day");
    itineraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const idx = dayIdx ?? 0;
  const day = trip.days[idx];

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-16">
      {/* header */}
      <header className="sticky top-0 z-10 -mx-4 border-b border-sand-200/80 bg-sand-100/90 px-4 pb-2.5 pt-3 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <div className="min-w-0 text-center">
            <p className="truncate font-display text-[17px] font-bold leading-tight text-clay-600">
              Peru & Bolivia <span className="text-gold-600">2026</span>
            </p>
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              Siddiqui family · Jul 23 – Aug 9
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Emergency & contacts"
              onClick={() => setTab(tab === "contacts" ? "day" : "contacts")}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-[16px] shadow-sm ${
                tab === "contacts"
                  ? "border-alert-600 bg-alert-600 text-white"
                  : "border-alert-600/40 bg-white text-alert-600"
              }`}
            >
              ☎
            </button>
            <div
              role="group"
              aria-label="View"
              className="flex rounded-full border border-sand-300 bg-white p-0.5 shadow-sm"
            >
              {(["family", "lead"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => switchView(v)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                    view === v ? "bg-clay-500 text-white" : "text-ink-soft"
                  }`}
                >
                  {v === "family" ? "Family" : "Trip Lead"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "lead" && (
          <nav aria-label="Trip lead tabs" className="mt-2.5 flex justify-center gap-1.5">
            {(
              [
                ["day", "Itinerary"],
                ["summary", "Bookings"],
                ["todo", "To Confirm"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                  tab === t
                    ? "bg-ink text-sand-50"
                    : "bg-sand-200/70 text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="pt-5">
        {tab === "contacts" && <ContactsPanel />}
        {tab === "summary" && view === "lead" && <SummaryPanel />}
        {tab === "todo" && view === "lead" && <TodoPanel />}

        {tab === "day" && (
          <>
            <HomeGreeting onJumpToToday={jumpToToday} />

            <div ref={itineraryRef} className="scroll-mt-24">
              {/* day rail */}
              <div className="mb-1 flex items-center justify-center gap-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
                  Itinerary
                </h2>
                <button
                  type="button"
                  onClick={jumpToToday}
                  className="rounded-full px-2.5 py-1 text-[12px] font-bold text-clay-600 active:bg-clay-50"
                >
                  Today
                </button>
              </div>
              <div className="-mx-4 mb-4 flex items-center">
                <button
                  type="button"
                  aria-label="Previous day"
                  onClick={() => setDayIdx(Math.max(0, idx - 1))}
                  disabled={idx === 0}
                  className="ml-1 shrink-0 px-2 py-2 text-[18px] font-bold text-clay-500 disabled:opacity-30"
                >
                  ‹
                </button>
                <div ref={railRef} className="rail flex flex-1 gap-1.5 overflow-x-auto px-1 py-1">
                  {trip.days.map((d, i) => (
                    <button
                      key={d.date}
                      type="button"
                      data-day={i}
                      onClick={() => setDayIdx(i)}
                      className={`relative shrink-0 rounded-xl border px-2.5 py-1.5 text-left transition-colors ${
                        i === idx
                          ? "border-clay-500 bg-clay-500 text-white shadow-sm"
                          : "border-sand-300 bg-white text-ink-soft"
                      }`}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70">
                        Day {d.index}
                      </span>
                      <span className="block whitespace-nowrap text-[11.5px] font-semibold">
                        {d.route}
                      </span>
                      {i === todayIdx && (
                        <span
                          aria-label="today"
                          className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${
                            i === idx ? "bg-gold-100" : "bg-clay-500"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Next day"
                  onClick={() => setDayIdx(Math.min(trip.days.length - 1, idx + 1))}
                  disabled={idx === trip.days.length - 1}
                  className="mr-1 shrink-0 px-2 py-2 text-[18px] font-bold text-clay-500 disabled:opacity-30"
                >
                  ›
                </button>
              </div>

              <DayView day={day} view={view} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
