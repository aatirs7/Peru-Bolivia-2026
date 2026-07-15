import type { Place } from "@/types";
import { mapsUrl } from "@/lib/maps";

/**
 * A plain href into the device's map app · never fetches, never renders tiles.
 * With the trip's offline areas downloaded, Maps routes with zero connectivity.
 *
 * Deliberately text-only: an SVG (lucide or inline) inside this anchor
 * hard-freezes Chromium's renderer during the home-to-plan transition.
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
          ? "inline-block text-[12px] font-medium text-clay-500 underline decoration-clay-200 underline-offset-2 active:text-clay-700"
          : "inline-block min-h-[40px] rounded-lg border border-sand-200 bg-white px-4 py-2 text-[13px] font-medium text-clay-600 active:bg-sand-100"
      }
    >
      {subtle ? "Open in Maps" : "Get Directions"}
    </a>
  );
}
