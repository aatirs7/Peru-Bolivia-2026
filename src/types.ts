export type Status = "confirmed" | "booked" | "to_confirm" | "gap";

export type CardKind = "flight" | "train" | "stay" | "tour" | "transport" | "gap";

export interface BookingCard {
  kind: CardKind;
  title: string;
  status: Status;
  /** Family-safe details: times, addresses, what's included. */
  lines: string[];
  /** Lead-only: confirmation number / PNR / receipt. */
  ref?: string;
  /** Lead-only: booking PIN. */
  pin?: string;
  /** Lead-only: where it was booked. */
  bookedVia?: string;
  /** Lead-only: passenger of record, balances due, contacts. */
  leadNote?: string;
  /** Optional map pin · cards without one simply don't show the Directions link. */
  place?: Place;
  /** Optional red-orange reminder badge shown to everyone. */
  alert?: string;
}

export interface ScheduleItem {
  time: string;
  text: string;
  /** Optional red-orange reminder badge, e.g. "Bring original passports". */
  alert?: string;
}

export interface Coords {
  lat: number;
  lng: number;
  label: string;
}

export type PlaceType = "hotel" | "station" | "airport" | "trailhead" | "tour";

/**
 * A physical place a card can deep-link to in the device's map app.
 * Prefer fixed lat/lng (guaranteed to work offline); `query` is a name/address
 * fallback for places whose exact coordinates we don't have · Maps resolves it,
 * including inside downloaded offline areas.
 */
export interface Place {
  type: PlaceType;
  label: string;
  lat?: number;
  lng?: number;
  query?: string;
}

export interface Day {
  /** 1-based day number. */
  index: number;
  /** ISO YYYY-MM-DD (local to the destination). */
  date: string;
  weekday: string;
  /** Full heading, e.g. "Washington DC → Lima, Peru". */
  title: string;
  /** Short route/city label for the rail and at-a-glance strip. */
  route: string;
  /** Where the family sleeps / spends the day · drives the weather location. */
  coords: Coords;
  cards: BookingCard[];
  schedule: ScheduleItem[];
  warn?: string;
  note?: string;
}

export interface SummaryRow {
  segment: string;
  dates: string;
  via: string;
  status: Status;
  reference?: string;
}

export type TodoTag =
  | "GAP"
  | "CONFIRM"
  | "PASSPORTS"
  | "CASH"
  | "HEALTH"
  | "WATCH"
  | "DOCS";

export interface TodoItem {
  tag: TodoTag;
  text: string;
}

export interface Trip {
  title: string;
  subtitle: string;
  /** ISO date of Day 1. */
  start: string;
  /** ISO date of the last day. */
  end: string;
  travelers: string[];
  lead: string;
  days: Day[];
  summary: SummaryRow[];
  todos: TodoItem[];
}

/** Cached weather snapshot persisted to localStorage (trip.weather). */
export interface WeatherSnapshot {
  locationName: string;
  tempC: number;
  tempF: number;
  hiC: number;
  loC: number;
  hiF: number;
  loF: number;
  condition: string;
  icon: string;
  /** ISO timestamp of the successful fetch. */
  fetchedAt: string;
}

export type SuggCategory =
  | "see"
  | "eat"
  | "walk"
  | "market"
  | "viewpoint"
  | "daytrip"
  | "active"
  | "relax";

export interface Suggestion {
  name: string;
  /** One sentence. */
  blurb: string;
  category: SuggCategory;
  /** Already on the itinerary · shown first as a highlight. */
  onItinerary?: boolean;
  tip?: string;
}

export interface Destination {
  id: string;
  name: string;
  /** 1-based itinerary day numbers that open this page. */
  dayNumbers: number[];
  intro: string;
  altitudeNote?: string;
  halalNote?: string;
  practical?: string[];
  suggestions: Suggestion[];
}
