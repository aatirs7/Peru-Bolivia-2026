import { bookingDetails } from "@/data/bookings";
import { trip } from "@/data/trip";
import type { TodoTag } from "@/types";
import StatusPill from "./StatusPill";

export function SummaryPanel({ onOpenBooking }: { onOpenBooking: (id: string) => void }) {
  return (
    <section aria-label="Bookings summary">
      <h2 className="text-center text-[20px] font-semibold tracking-tight text-ink">
        Bookings summary
      </h2>
      <p className="mb-3 mt-1 text-center text-[11.5px] text-ink-faint">
        Tap any booking for timings, refs and contacts.
      </p>
      <div className="space-y-2.5">
        {bookingDetails.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onOpenBooking(b.id)}
            className="w-full rounded-xl border border-sand-200/70 bg-card p-4 text-center shadow-card active:bg-sand-100"
          >
            <div className="flex justify-center">
              <StatusPill status={b.status} />
            </div>
            <p className="mt-1.5 text-[14px] font-semibold leading-snug text-ink">
              {b.title}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-faint">
              {b.dates}{b.bookedVia ? ` · ${b.bookedVia.split(" · ")[0].replace("(direct)", "").trim()}` : ""}
            </p>
            {b.ref && (
              <p className="mt-1 font-mono text-[12.5px] tracking-tight text-ink-soft">
                {b.ref}{b.pin ? ` · PIN ${b.pin}` : ""}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

const tagCls: Record<TodoTag, string> = {
  GAP: "bg-alert-100 text-alert-600 dark:bg-alert-600/20 dark:text-alert-300",
  CONFIRM: "bg-clay-100 text-clay-700 dark:text-clay-300",
  PASSPORTS: "bg-andes-100 text-andes-800 dark:bg-andes-800/40 dark:text-andes-100",
  CASH: "bg-gold-100 text-gold-600 dark:bg-gold-400/15 dark:text-gold-400",
  HEALTH: "bg-andes-100 text-andes-800 dark:bg-andes-800/40 dark:text-andes-100",
  WATCH: "bg-gold-100 text-gold-600 dark:bg-gold-400/15 dark:text-gold-400",
  DOCS: "bg-sand-200 text-ink-soft",
};

export function TodoPanel() {
  return (
    <section aria-label="Things to confirm">
      <h2 className="mb-3 text-center text-[20px] font-semibold tracking-tight text-ink">
        Things to confirm & notes
      </h2>
      <div className="space-y-2.5">
        {trip.todos.map((todo, i) => (
          <div
            key={i}
            className="rounded-xl border border-sand-200/70 bg-card p-4 text-center shadow-card"
          >
            <span
              className={`mb-1.5 inline-block rounded-md px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] ${tagCls[todo.tag]}`}
            >
              {todo.tag}
            </span>
            <p className="text-[13.5px] leading-snug text-ink-soft">{todo.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
