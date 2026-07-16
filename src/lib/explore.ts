import { DESTINATIONS } from "@/data/destinations";
import type { Destination, Place, Suggestion } from "@/types";

/** Destination for a 0-based itinerary day index, if any. */
export function destinationForDay(dayIdx: number): Destination | undefined {
  return DESTINATIONS.find((d) => d.dayNumbers.includes(dayIdx + 1));
}

const cityQuery: Record<string, string> = {
  lima: "Lima, Peru",
  cusco: "Cusco, Peru",
  "sacred-valley": "Sacred Valley, Peru",
  "aguas-calientes": "Aguas Calientes, Peru",
  "la-paz": "La Paz, Bolivia",
  uyuni: "Uyuni, Bolivia",
};

/**
 * Maps pin for a suggestion: query by name + city text (more robust than
 * guessed coordinates). Reuses the existing deep-link pattern.
 */
export function suggestionPlace(destId: string, s: Suggestion): Place {
  const name = s.name.split(" · ")[0].split(" (")[0];
  return {
    type: "tour",
    label: s.name,
    query: `${name}, ${cityQuery[destId] ?? ""}`,
  };
}
