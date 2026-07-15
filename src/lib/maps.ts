import type { Place } from "@/types";

/**
 * Google Maps universal deep-link · one consistent default everywhere.
 * Opens the Google Maps app when installed (Android & iOS), else the browser.
 * It's just an href: no fetch, no tiles, no runtime network. With the trip's
 * offline areas downloaded, Maps routes with zero connectivity.
 */
export function mapsUrl(place: Place): string {
  const q =
    place.lat != null && place.lng != null
      ? `${place.lat},${place.lng}`
      : encodeURIComponent(place.query ?? place.label);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Cities the family should download as Google Maps offline areas before losing signal. */
export const OFFLINE_AREAS = ["Lima", "Cusco", "Aguas Calientes", "La Paz", "Uyuni"];
