import type { BookingCard as Card, CardKind } from "@/types";
import type { View } from "@/lib/useView";
import MapLink from "./MapLink";
import StatusPill from "./StatusPill";

const kindIcon: Record<CardKind, string> = {
  flight: "✈️",
  train: "🚆",
  stay: "🏠",
  tour: "🥾",
  transport: "🚐",
  gap: "⚠️",
};

export default function BookingCard({ card, view }: { card: Card; view: View }) {
  const isGap = card.status === "gap";
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-card ${
        isGap ? "border-alert-600/30 bg-alert-100/40" : "border-sand-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[15px] font-semibold leading-snug text-ink">
          <span aria-hidden className="mr-1.5">{kindIcon[card.kind]}</span>
          {card.title}
        </p>
        <StatusPill status={card.status} />
      </div>

      <ul className="mt-2 space-y-1">
        {card.lines.map((line, i) => (
          <li key={i} className="text-[13.5px] leading-snug text-ink-soft">
            {line}
          </li>
        ))}
      </ul>

      {card.place && (
        <div className="mt-2.5">
          <MapLink place={card.place} subtle />
        </div>
      )}

      {view === "lead" && (card.ref || card.pin || card.bookedVia || card.leadNote) && (
        <div className="mt-3 rounded-xl border border-dashed border-clay-300/60 bg-clay-50 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-clay-600">
            Trip lead
          </p>
          <dl className="space-y-0.5 text-[13px] leading-snug text-ink-soft">
            {card.ref && (
              <div>
                <dt className="inline font-semibold text-ink">Ref: </dt>
                <dd className="inline font-mono tracking-tight">{card.ref}</dd>
              </div>
            )}
            {card.pin && (
              <div>
                <dt className="inline font-semibold text-ink">PIN: </dt>
                <dd className="inline font-mono tracking-tight">{card.pin}</dd>
              </div>
            )}
            {card.bookedVia && (
              <div>
                <dt className="inline font-semibold text-ink">Booked via: </dt>
                <dd className="inline">{card.bookedVia}</dd>
              </div>
            )}
            {card.leadNote && <div className="pt-0.5">{card.leadNote}</div>}
          </dl>
        </div>
      )}
    </div>
  );
}
