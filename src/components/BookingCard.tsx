import {
  BedDouble,
  Bus,
  Mountain,
  Plane,
  TrainFront,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { BookingCard as Card, CardKind } from "@/types";
import type { View } from "@/lib/useView";
import MapLink from "./MapLink";
import StatusPill from "./StatusPill";

const kindIcon: Record<CardKind, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  stay: BedDouble,
  tour: Mountain,
  transport: Bus,
  gap: TriangleAlert,
};

export default function BookingCard({ card, view }: { card: Card; view: View }) {
  const Icon = kindIcon[card.kind];
  const isGap = card.status === "gap";
  return (
    <div
      className={`rounded-xl bg-white p-5 text-center shadow-card ${
        isGap ? "border border-alert-600/25" : "border border-sand-200/70"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon
          size={18}
          strokeWidth={1.75}
          className={isGap ? "text-alert-600" : "text-clay-500"}
          aria-hidden
        />
        <p className="text-[15px] font-semibold leading-snug tracking-tight text-ink">
          {card.title}
        </p>
        <StatusPill status={card.status} />
      </div>

      <ul className="mt-2.5 space-y-1">
        {card.lines.map((line, i) => (
          <li key={i} className="text-[13px] leading-snug text-ink-soft">
            {line}
          </li>
        ))}
      </ul>

            {card.place && (
        <div className="mt-3">
          <MapLink place={card.place} subtle />
        </div>
      )}

      {view === "lead" && (card.ref || card.pin || card.bookedVia || card.leadNote) && (
        <div className="mt-4 border-t border-sand-200/80 pt-3">
          <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-clay-500">
            Trip lead
          </p>
          <dl className="space-y-0.5 text-[12.5px] leading-snug text-ink-soft">
            {card.ref && (
              <div>
                <dt className="inline font-medium text-ink">Ref: </dt>
                <dd className="inline font-mono tracking-tight">{card.ref}</dd>
              </div>
            )}
            {card.pin && (
              <div>
                <dt className="inline font-medium text-ink">PIN: </dt>
                <dd className="inline font-mono tracking-tight">{card.pin}</dd>
              </div>
            )}
            {card.bookedVia && (
              <div>
                <dt className="inline font-medium text-ink">Booked via: </dt>
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
