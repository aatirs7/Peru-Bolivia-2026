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
      <header className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay-500">
          Day {String(day.index).padStart(2, "0")} · {day.weekday} · {prettyDate(day.date)}
        </p>
        <h2 className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink">
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
        <div className="mt-3 rounded-2xl border border-gold-400/40 bg-gold-100/60 px-4 py-3 text-[13.5px] leading-snug text-ink-soft">
          <span aria-hidden className="mr-1.5">⚠️</span>
          {day.warn}
        </div>
      )}

      {day.schedule.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
            The day
          </h3>
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
            <table className="w-full">
              <tbody>
                {day.schedule.map((item, i) => (
                  <tr key={i} className={i > 0 ? "border-t border-sand-100" : ""}>
                    <td className="w-[112px] whitespace-nowrap py-2.5 pl-4 pr-2 align-top text-[12px] font-semibold tabular-nums text-clay-600">
                      {item.time}
                    </td>
                    <td className="py-2.5 pl-1 pr-4 align-top text-[13.5px] leading-snug text-ink-soft">
                      {item.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {day.note && (
        <p className="mt-4 border-l-2 border-sand-300 pl-3 text-[13px] italic leading-snug text-ink-faint">
          {day.note}
        </p>
      )}
    </section>
  );
}
