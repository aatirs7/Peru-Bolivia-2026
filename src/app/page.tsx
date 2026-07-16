"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import ContactsPanel from "@/components/ContactsPanel";
import DayView from "@/components/DayView";
import { SummaryPanel, TodoPanel } from "@/components/LeadPanels";
import Overview, { type Screen } from "@/components/Overview";
import PdfPanel from "@/components/PdfPanel";
import PlacesPanel from "@/components/PlacesPanel";
import { trip } from "@/data/trip";
import { useTheme } from "@/lib/useTheme";
import { todayIndex } from "@/lib/useToday";
import { useView, type View } from "@/lib/useView";

export default function Page() {
  const [view, setView] = useView();
  const [theme, toggleTheme] = useTheme();
  const [screen, setScreen] = useState<Screen>("home");
  // null until mount · today is resolved client-side to avoid hydration mismatch
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [todayIdx, setTodayIdx] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = todayIndex();
    setTodayIdx(t);
    setDayIdx(t);
  }, []);

  // keep the selected chip visible in the rail
  useEffect(() => {
    if (dayIdx === null || screen !== "plan") return;
    railRef.current
      ?.querySelector(`[data-day="${dayIdx}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [dayIdx, screen]);

  // start each screen at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const switchView = (v: View) => {
    setView(v);
    // lead-only screens close when leaving Trip Lead
    if (v === "family" && (screen === "summary" || screen === "todo")) setScreen("home");
  };

  const openTodaysPlan = () => {
    const t = todayIndex();
    setTodayIdx(t);
    setDayIdx(t);
    setScreen("plan");
  };

  const openDay = (i: number) => {
    setTodayIdx(todayIndex());
    setDayIdx(i);
    setScreen("plan");
  };

  const idx = dayIdx ?? 0;
  const day = trip.days[idx];

  return (
    <div className="mx-auto min-h-screen max-w-lg px-5 pb-14 sm:px-6">
      {/* header */}
      <header className="sticky top-0 z-10 -mx-5 border-b border-sand-200/70 bg-bone/90 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="grid grid-cols-[64px_1fr_auto] items-center gap-2">
          <div>
            {screen !== "home" && (
              <button
                type="button"
                onClick={() => setScreen("home")}
                aria-label="Back to overview"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-sand-200 bg-card text-ink-soft shadow-card active:bg-sand-100"
              >
                <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
          <p className="text-center text-[13px] font-semibold tracking-tight text-ink">
            Peru & Bolivia <span className="text-clay-500">2026</span>
          </p>
          <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 bg-card text-ink-soft shadow-card active:bg-sand-100"
          >
            {theme === "dark" ? (
              <Sun size={15} strokeWidth={1.75} aria-hidden />
            ) : (
              <Moon size={15} strokeWidth={1.75} aria-hidden />
            )}
          </button>
          <div
            role="group"
            aria-label="View"
            className="flex rounded-lg border border-sand-200 bg-card p-0.5 shadow-card"
          >
            {(["family", "lead"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => switchView(v)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  view === v ? "bg-clay-600 text-white" : "text-ink-faint"
                }`}
              >
                {v === "family" ? "Family" : "Lead"}
              </button>
            ))}
          </div>
          </div>
        </div>
      </header>

      <main className="pt-6">
        {screen === "home" && (
          <Overview view={view} onNavigate={setScreen} onTodaysPlan={openTodaysPlan} onOpenDay={openDay} />
        )}

        {screen === "contacts" && <ContactsPanel />}
        {screen === "places" && <PlacesPanel />}
        {screen === "pdf" && <PdfPanel />}
        {screen === "summary" && view === "lead" && <SummaryPanel />}
        {screen === "todo" && view === "lead" && <TodoPanel />}

        {screen === "plan" && (
          <>
            {/* day switcher lives here, not on the overview */}
            <div className="mb-1 flex items-center justify-center gap-3">
              <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Itinerary
              </h2>
              <button
                type="button"
                onClick={() => {
                  const t = todayIndex();
                  setTodayIdx(t);
                  setDayIdx(t);
                }}
                className="rounded-md px-2 py-1 text-[12px] font-semibold text-clay-600 active:bg-sand-100"
              >
                Today
              </button>
            </div>
            <div className="-mx-5 mb-5 flex items-center sm:-mx-6">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => setDayIdx(Math.max(0, idx - 1))}
                disabled={idx === 0}
                className="ml-1 shrink-0 px-2 py-2 text-ink-soft disabled:opacity-30"
              >
                <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
              </button>
              <div ref={railRef} className="rail flex flex-1 gap-1.5 overflow-x-auto px-1 py-1">
                {trip.days.map((d, i) => (
                  <button
                    key={d.date}
                    type="button"
                    data-day={i}
                    onClick={() => setDayIdx(i)}
                    className={`relative shrink-0 rounded-lg border px-2.5 py-1.5 text-center transition-colors ${
                      i === idx
                        ? "border-clay-600 bg-clay-600 text-white"
                        : "border-sand-200 bg-card text-ink-soft"
                    }`}
                  >
                    <span className="block text-[9.5px] font-semibold uppercase tracking-[0.06em] opacity-70">
                      Day {d.index}
                    </span>
                    <span className="block whitespace-nowrap text-[11.5px] font-medium">
                      {d.route}
                    </span>
                    {i === todayIdx && (
                      <span
                        aria-label="today"
                        className={`absolute right-1.5 top-1.5 h-1 w-1 rounded-full ${
                          i === idx ? "bg-card" : "bg-clay-500"
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
                className="mr-1 shrink-0 rotate-180 px-2 py-2 text-ink-soft disabled:opacity-30"
              >
                <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            <DayView day={day} view={view} />
          </>
        )}
      </main>
    </div>
  );
}
