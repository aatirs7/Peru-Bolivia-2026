import type { ScheduleItem } from "@/types";

/**
 * Structured time handling for schedule blocks. Times are edited with real
 * dropdowns (hour / minute / AM-PM), but stored as the same human string the
 * itinerary already uses ("9:00 AM", "9:00 AM – 10:00 AM"). Non-clock entries
 * ("Morning", "Layover", "~10:30 AM") are kept as free-form labels.
 */

export interface ParsedTime {
  /** Minutes past midnight, or null if not a clock time. */
  startMin: number | null;
  endMin: number | null;
  /** The raw string when it isn't a clean clock time (a label). */
  label: string | null;
}

function parseClock(s: string, inheritAp?: "AM" | "PM"): number | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = (m[3] || inheritAp || "").toUpperCase();
  if (!ap || h > 12 || h < 1 || min > 59) return null;
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export function parseTimeField(raw: string): ParsedTime {
  const s = (raw ?? "").trim();
  if (!s) return { startMin: null, endMin: null, label: null };
  const parts = s.split(/\s*[–—-]\s*/);
  if (parts.length === 2) {
    const apMatch = s.match(/\b(am|pm)\b/i);
    const shared = apMatch ? (apMatch[1].toUpperCase() as "AM" | "PM") : undefined;
    const a = parseClock(parts[0], shared);
    const b = parseClock(parts[1], shared);
    if (a !== null && b !== null) return { startMin: a, endMin: b, label: null };
  } else {
    const a = parseClock(s);
    if (a !== null) return { startMin: a, endMin: null, label: null };
  }
  return { startMin: null, endMin: null, label: s };
}

export function formatMin(m: number): string {
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const ap = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 || 12;
  return `${h}:${String(min).padStart(2, "0")} ${ap}`;
}

export function composeClock(startMin: number, endMin: number | null): string {
  return endMin !== null ? `${formatMin(startMin)} – ${formatMin(endMin)}` : formatMin(startMin);
}

/** Split minutes into 12-hour clock parts for the dropdowns. */
export function minuteParts(m: number): { h12: number; min: number; ap: "AM" | "PM" } {
  const h24 = Math.floor(m / 60);
  return { h12: h24 % 12 || 12, min: m % 60, ap: h24 >= 12 ? "PM" : "AM" };
}

export function partsToMinutes(h12: number, min: number, ap: "AM" | "PM"): number {
  const h24 = ap === "PM" ? (h12 % 12) + 12 : h12 % 12;
  return h24 * 60 + min;
}

/**
 * Sort blocks by start time. Clock-time blocks order chronologically; label
 * blocks (Morning, Layover…) keep their relative order and trail the clock
 * ones. Stable.
 */
export function sortByTime(items: ScheduleItem[]): ScheduleItem[] {
  return items
    .map((it, i) => ({ it, i, key: parseTimeField(it.time).startMin }))
    .sort((a, b) => (a.key ?? Infinity) - (b.key ?? Infinity) || a.i - b.i)
    .map((x) => x.it);
}
