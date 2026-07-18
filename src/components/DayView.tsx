import { Pencil, Sunrise, Sunset, TriangleAlert } from "lucide-react";
import type { Day } from "@/types";
import type { View } from "@/lib/useView";
import { sunTimes } from "@/lib/sun";
import BookingCard from "./BookingCard";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DayView({
  day,
  view,
  exploreName,
  onExplore,
  edited,
  onEdit,
  onReset,
}: {
  day: Day;
  view: View;
  exploreName?: string;
  onExplore?: () => void;
  /** True when the lead has saved edits for this day. */
  edited?: boolean;
  /** Lead-only · opens the day editor. */
  onEdit?: () => void;
  /** Lead-only · clears this day's edits. */
  onReset?: () => void;
}) {
  const sun = sunTimes(day.coords, day.date);

  return (
    <section aria-label={`Day ${day.index}`}>
      <header className="mb-5 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
          Day {String(day.index).padStart(2, "0")} · {day.weekday} · {prettyDate(day.date)}
        </p>
        <h2 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-tight text-ink">
          {day.title}
        </h2>

        {/* sunrise / sunset · computed on-device, offline */}
        <p className="mt-1.5 flex items-center justify-center gap-3 text-[12px] font-medium text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Sunrise size={13} strokeWidth={1.75} className="text-gold-600 dark:text-gold-400" aria-hidden />
            {sun.sunrise}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sunset size={13} strokeWidth={1.75} className="text-clay-500" aria-hidden />
            {sun.sunset}
          </span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          {exploreName && onExplore && (
            <button
              type="button"
              onClick={onExplore}
              className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-clay-600 shadow-card active:bg-sand-100"
            >
              Explore {exploreName} →
            </button>
          )}
          {view === "lead" && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-soft shadow-card active:bg-sand-100"
            >
              <Pencil size={13} strokeWidth={1.75} aria-hidden /> Edit day
            </button>
          )}
        </div>

        {edited && view === "lead" && (
          <p className="mt-2 text-[11px] text-ink-faint">
            You've edited this day.{" "}
            {onReset && (
              <button type="button" onClick={onReset} className="font-medium text-alert-600 underline decoration-alert-300 underline-offset-2">
                Reset to original
              </button>
            )}
          </p>
        )}
      </header>

      {day.cards.length > 0 && (
        <div className="space-y-3">
          {day.cards.map((card, i) => (
            <BookingCard key={i} card={card} view={view} />
          ))}
        </div>
      )}

      {day.warn && (
        <div className="mt-3 flex items-start justify-center gap-2 rounded-xl border border-gold-400/30 bg-gold-100/40 px-4 py-3 text-center text-[13px] leading-snug text-ink-soft dark:border-gold-400/20 dark:bg-gold-400/10">
          <TriangleAlert size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span>{day.warn}</span>
        </div>
      )}

      {day.schedule.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2.5 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            The day
          </h3>
          <div className="rounded-xl border border-sand-200/70 bg-card shadow-card">
            {day.schedule.map((item, i) => (
              <div
                key={i}
                className={`px-5 py-3.5 text-center ${i > 0 ? "border-t border-sand-100" : ""}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums text-clay-500">
                  {item.time}
                </p>
                <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {day.note && (
        <p className="mt-5 text-center text-[12.5px] italic leading-relaxed text-ink-faint">
          {day.note}
        </p>
      )}
    </section>
  );
}
