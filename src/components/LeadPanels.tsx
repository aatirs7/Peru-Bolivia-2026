import { trip } from "@/data/trip";
import type { TodoTag } from "@/types";
import StatusPill from "./StatusPill";

export function SummaryPanel() {
  return (
    <section aria-label="Bookings summary">
      <h2 className="mb-3 text-center text-[20px] font-semibold tracking-tight text-ink">
        Bookings summary
      </h2>
      <div className="space-y-2.5">
        {trip.summary.map((row, i) => (
          <div
            key={i}
            className="rounded-xl border border-sand-200/70 bg-white p-4 text-center shadow-card"
          >
            <div className="flex justify-center">
              <StatusPill status={row.status} />
            </div>
            <p className="mt-1.5 text-[14px] font-semibold leading-snug text-ink">
              {row.segment}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-faint">
              {row.dates} · via {row.via}
            </p>
            {row.reference && (
              <p className="mt-1 font-mono text-[12.5px] tracking-tight text-ink-soft">
                {row.reference}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const tagCls: Record<TodoTag, string> = {
  GAP: "bg-alert-100 text-alert-600",
  CONFIRM: "bg-clay-100 text-clay-700",
  PASSPORTS: "bg-andes-100 text-andes-800",
  CASH: "bg-gold-100 text-gold-600",
  HEALTH: "bg-andes-100 text-andes-800",
  WATCH: "bg-gold-100 text-gold-600",
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
            className="rounded-xl border border-sand-200/70 bg-white p-4 text-center shadow-card"
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
