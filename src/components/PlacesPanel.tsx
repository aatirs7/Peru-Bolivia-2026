import {
  BedDouble,
  Mountain,
  Plane,
  TrainFront,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { PLACES } from "@/data/trip";
import { OFFLINE_AREAS } from "@/lib/maps";
import type { PlaceType } from "@/types";
import MapLink from "./MapLink";

const typeIcon: Record<PlaceType, LucideIcon> = {
  hotel: BedDouble,
  station: TrainFront,
  airport: Plane,
  trailhead: Mountain,
  tour: Landmark,
};

const typeLabel: Record<PlaceType, string> = {
  hotel: "Stay",
  station: "Train station",
  airport: "Airport",
  trailhead: "Trailhead",
  tour: "Meeting point",
};

/** Every pinned place on the trip · plain map deep-links, zero network. */
export default function PlacesPanel() {
  const places = Object.values(PLACES);
  return (
    <section aria-label="Map pins" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">Map pins</h2>
      <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-faint">
        Links open your Maps app and work offline once you've downloaded the
        offline areas: {OFFLINE_AREAS.join(", ")}.
      </p>

      <div className="mt-4 space-y-2.5">
        {places.map((p) => {
          const Icon = typeIcon[p.type];
          return (
            <div
              key={p.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-sand-200/70 bg-card px-4 py-4 shadow-card"
            >
              <Icon size={17} strokeWidth={1.75} className="text-clay-500" aria-hidden />
              <p className="text-[14px] font-semibold leading-snug text-ink">{p.label}</p>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                {typeLabel[p.type]}
              </p>
              <div className="mt-1">
                <MapLink place={p} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
