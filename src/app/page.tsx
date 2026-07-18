"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft, Moon, Sun } from "lucide-react";
import AlertsPanel from "@/components/AlertsPanel";
import BookingDetailPanel from "@/components/BookingDetailPanel";
import ContactsPanel from "@/components/ContactsPanel";
import { DestinationPanel, DestinationsPanel } from "@/components/ExplorePanels";
import IssuesPanel from "@/components/IssuesPanel";
import DayView from "@/components/DayView";
import { SummaryPanel, TodoPanel } from "@/components/LeadPanels";
import Overview, { type Screen } from "@/components/Overview";
import PdfPanel from "@/components/PdfPanel";
import PlacesPanel from "@/components/PlacesPanel";
import RevisionsPanel from "@/components/RevisionsPanel";
import { bookingDetails } from "@/data/bookings";
import { DESTINATIONS } from "@/data/destinations";
import { trip } from "@/data/trip";
import { destinationForDay } from "@/lib/explore";
import { useAlerts } from "@/lib/useAlerts";
import { useDayEdits } from "@/lib/useDayEdits";
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
  const { groups, badge, isDone, toggleDone } = useAlerts(view);
  const { overrides, effective, saveDay, resetDay } = useDayEdits();
  const [destId, setDestId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

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
    if (
      v === "family" &&
      (screen === "summary" || screen === "todo" || screen === "issues" || screen === "booking" || screen === "revisions")
    )
      setScreen("home");
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

  const openExplore = (id: string) => {
    setDestId(id);
    setScreen("explore");
  };

  const openBooking = (id: string) => {
    setBookingId(id);
    setScreen("booking");
  };

  // back steps out one level for nested screens, else home
  const goBack = () => {
    if (screen === "explore") setScreen("destinations");
    else if (screen === "booking") setScreen("summary");
    else setScreen("home");
  };

  const idx = dayIdx ?? 0;
  const day = effective(idx);
  const ov = overrides[idx];
  const dayEdited = !!ov && ov.schedule !== undefined;
  const isHome = screen === "home";

  return (
    // home locks to the viewport (no page scroll); other screens scroll normally
    <div
      className={`mx-auto max-w-lg pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] ${
        isHome
          ? "fixed inset-0 flex flex-col overflow-hidden overscroll-none pb-[env(safe-area-inset-bottom)]"
          : "min-h-screen pb-[calc(env(safe-area-inset-bottom)+3.5rem)]"
      }`}
    >
      {/* header */}
      <header className="sticky top-0 z-10 -mx-5 shrink-0 border-b border-sand-200/70 bg-bone px-5 py-3">
        <div className="grid grid-cols-[36px_1fr_auto] items-center gap-2">
          <div>
            {screen !== "home" && (
              <button
                type="button"
                onClick={goBack}
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
          <div className="flex items-center gap-1.5 justify-self-end">
          <button
            type="button"
            aria-label="Alerts"
            onClick={() => setScreen(screen === "alerts" ? "home" : "alerts")}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border shadow-card ${
              screen === "alerts"
                ? "border-clay-600 bg-clay-600 text-white"
                : "border-sand-200 bg-card text-ink-soft active:bg-sand-100"
            }`}
          >
            <Bell size={15} strokeWidth={1.75} aria-hidden />
            {badge > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-alert-600 px-1 text-[9px] font-bold leading-none text-white">
                {badge}
              </span>
            )}
          </button>
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

      <main className={isHome ? "min-h-0 flex-1 overflow-hidden pb-3 pt-4" : "pt-6"}>
        {screen === "home" && (
          <Overview view={view} onNavigate={setScreen} onTodaysPlan={openTodaysPlan} onOpenDay={openDay} />
        )}

        {screen === "contacts" && <ContactsPanel />}
        {screen === "alerts" && (
          <AlertsPanel
            view={view}
            groups={groups}
            isDone={isDone}
            toggleDone={toggleDone}
            onOpenDay={openDay}
          />
        )}
        {screen === "issues" && view === "lead" && <IssuesPanel onOpenDay={openDay} />}
        {screen === "revisions" && view === "lead" && <RevisionsPanel />}
        {screen === "places" && <PlacesPanel />}
        {screen === "pdf" && <PdfPanel />}
        {screen === "summary" && view === "lead" && <SummaryPanel onOpenBooking={openBooking} />}
        {screen === "destinations" && <DestinationsPanel onOpen={openExplore} />}
        {screen === "explore" && destId && (
          <DestinationPanel dest={DESTINATIONS.find((d) => d.id === destId) ?? DESTINATIONS[0]} />
        )}
        {screen === "booking" && view === "lead" && bookingId && (
          <BookingDetailPanel
            booking={bookingDetails.find((b) => b.id === bookingId) ?? bookingDetails[0]}
            onOpenDay={openDay}
          />
        )}
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
                {trip.days.map((d, i) => {
                  const iEdited = !!overrides[i] && overrides[i].schedule !== undefined;
                  return (
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
                        {effective(i).route}
                      </span>
                      {i === todayIdx && (
                        <span
                          aria-label="today"
                          className={`absolute right-1.5 top-1.5 h-1 w-1 rounded-full ${
                            i === idx ? "bg-card" : "bg-clay-500"
                          }`}
                        />
                      )}
                      {iEdited && (
                        <span
                          aria-label="edited"
                          className={`absolute left-1.5 top-1.5 h-1 w-1 rounded-full ${
                            i === idx ? "bg-card" : "bg-gold-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
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

            <DayView
              key={`day-${idx}-${ov?.updatedAt ?? "base"}`}
              day={day}
              view={view}
              exploreName={destinationForDay(idx)?.name}
              onExplore={() => {
                const d = destinationForDay(idx);
                if (d) openExplore(d.id);
              }}
              edited={dayEdited}
              editable={view === "lead"}
              onSave={(patch) => saveDay(idx, patch)}
              onResetDay={() => resetDay(idx)}
            />
          </>
        )}
      </main>
    </div>
  );
}
