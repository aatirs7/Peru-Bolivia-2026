import { TriangleAlert } from "lucide-react";
import type { Day } from "@/types";
import type { View } from "@/lib/useView";
import BookingCard from "./BookingCard";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DayView({ day, view }: { day: Day; view: View }) {
  return (
    <section aria-label={`Day ${day.index}`}>
      <header className="mb-5 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
          Day {String(day.index).padStart(2, "0")} · {day.weekday} · {prettyDate(day.date)}
        </p>
        <h2 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-tight text-ink">
          {day.title}
        </h2>
      </header>

      {day.cards.length > 0 && (
        <div className="space-y-3">
          {day.cards.map((card, i) => (
            <BookingCard key={i} card={card} view={view} />
          ))}
        </div>
      )}

      {day.warn && (
        <div className="mt-3 flex items-start justify-center gap-2 rounded-xl border border-gold-400/30 bg-gold-100/40 px-4 py-3 dark:border-gold-400/20 dark:bg-gold-400/10 text-center text-[13px] leading-snug text-ink-soft">
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
