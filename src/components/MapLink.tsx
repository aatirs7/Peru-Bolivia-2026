import type { Place, PlaceType } from "@/types";
import { mapsUrl } from "@/lib/maps";

const typeIcon: Record<PlaceType, string> = {
  hotel: "🏠",
  station: "🚉",
  airport: "🛫",
  trailhead: "⛰️",
  tour: "📍",
};

/**
 * A plain href into the device's map app — never fetches, never renders tiles.
 * With the trip's offline areas downloaded, Maps routes with zero connectivity.
 */
export default function MapLink({
  place,
  subtle = false,
}: {
  place: Place;
  subtle?: boolean;
}) {
  return (
    <a
      href={mapsUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        subtle
          ? "inline-flex items-center gap-1 text-[12.5px] font-semibold text-clay-500 underline decoration-clay-200 underline-offset-2 active:text-clay-700"
          : "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-clay-200 bg-clay-50 px-3.5 py-1.5 text-[13px] font-semibold text-clay-600 active:bg-clay-100"
      }
    >
      <span aria-hidden>{typeIcon[place.type]}</span>
      <span>{subtle ? "Open in Maps" : "Directions"}</span>
    </a>
  );
}
