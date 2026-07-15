import { trip } from "@/data/trip";

/** Local device date as YYYY-MM-DD · built from local components, no UTC drift. */
export function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 0-based index into trip.days for "today" on the device clock.
 * Before the trip → Day 1 (0); after → the last day; during → the matching day.
 * Assumes days[] is chronological (it is · the rail relies on it too).
 */
export function todayIndex(now: Date = new Date()): number {
  const today = localISO(now);
  if (today < trip.start) return 0;
  if (today > trip.end) return trip.days.length - 1;
  const i = trip.days.findIndex((d) => d.date === today);
  return i >= 0 ? i : 0;
}

export type TripPhase = "before" | "during" | "after";

export function tripPhase(now: Date = new Date()): TripPhase {
  const today = localISO(now);
  if (today < trip.start) return "before";
  if (today > trip.end) return "after";
  return "during";
}

/** Whole days until departure (only meaningful in the "before" phase). */
export function daysUntilDeparture(now: Date = new Date()): number {
  const [y, m, d] = trip.start.split("-").map(Number);
  const start = new Date(y, m - 1, d); // local midnight of departure day
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}
