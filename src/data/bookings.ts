import type { CardKind, Place, Status } from "@/types";
import { PLACES } from "./trip";

export interface BookingLink {
  label: string;
  /** tel:, mailto:, https:// (websites need wifi · maps/tel work offline). */
  url: string;
}

/**
 * One page per booking · everything the lead needs in one tap: timings,
 * refs, contacts and links. Only verified contact details are included
 * (from the confirmations / itinerary PDF); official websites otherwise.
 */
export interface BookingDetail {
  id: string;
  title: string;
  kind: CardKind;
  status: Status;
  dates: string;
  /** Key timings, one per line. */
  timings?: string[];
  ref?: string;
  pin?: string;
  bookedVia?: string;
  /** Passenger of record, balances, fine print. */
  notes?: string[];
  links?: BookingLink[];
  place?: Place;
  /** Related itinerary days (0-based). */
  dayIdxs?: number[];
}

export const bookingDetails: BookingDetail[] = [
  {
    id: "avianca-roundtrip",
    title: "Avianca · IAD ⇄ LIM / LPB (via Bogota)",
    kind: "flight",
    status: "confirmed",
    dates: "Jul 23 & Aug 9",
    timings: [
      "Out Jul 23: IAD 6:50 AM → BOG (2h 15m layover) → LIM 4:30 PM",
      "Home Aug 9: LPB 3:25 AM → BOG (1h 30m layover, tight) → IAD 2:15 PM",
      "Arrive ~3 hrs early both ways · leave La Paz lodging ~12:30 AM on Aug 9",
    ],
    ref: "BANUIE",
    bookedVia: "JustFly · booking #299-502-632",
    notes: ["6 travelers on one booking", "Seats not assigned yet · pick at check-in"],
    links: [
      { label: "Avianca check-in", url: "https://www.avianca.com" },
      { label: "JustFly booking", url: "https://www.justfly.com" },
    ],
    place: PLACES.iad,
    dayIdxs: [0, 17],
  },
  {
    id: "jetsmart-lim-cuz",
    title: "JetSMART · LIM → CUZ (JA7041)",
    kind: "flight",
    status: "confirmed",
    dates: "Jul 26",
    timings: ["LIM 6:50 PM → CUZ 8:15 PM · direct", "Check-in opens Jul 23 per the booking"],
    ref: "R9UF3G",
    bookedVia: "JetSMART direct (booking.jetsmart.com)",
    notes: ["6 passengers · fully paid ($0 due)"],
    links: [{ label: "JetSMART check-in", url: "https://www.jetsmart.com" }],
    place: PLACES.lim,
    dayIdxs: [3],
  },
  {
    id: "perurail",
    title: "PeruRail · Ollantaytambo ⇄ Aguas Calientes",
    kind: "train",
    status: "confirmed",
    dates: "Jul 30 & Aug 1",
    timings: [
      "Out Jul 30: Vistadome Observatory 303 · Ollantaytambo 1:27 PM → Aguas Calientes 2:50 PM",
      "Back Aug 1: Expedition 84P · Aguas Calientes 6:20 PM → Ollantaytambo 8:05 PM",
    ],
    ref: "Vistadome 303 / Expedition 84P",
    bookedVia: "PeruRail (book.perurail.com)",
    notes: [
      "Passenger of record: Adeel Siddiqui (doc 679093755) · party on the same booking",
      "Ground transport Cusco ⇄ Ollantaytambo (~2 hrs each way) still needs arranging",
    ],
    links: [{ label: "PeruRail", url: "https://www.perurail.com" }],
    place: PLACES.ollantaStation,
    dayIdxs: [7, 9],
  },
  {
    id: "cuz-lpb",
    title: "Cusco → La Paz flight",
    kind: "flight",
    status: "confirmed",
    dates: "Aug 3",
    timings: ["CUZ 12:30 PM → LPB 2:45 PM · direct · 1h 15m"],
    ref: "BCL2SZ",
    bookedVia: "JustFly · booking #299-889-112",
    links: [{ label: "JustFly booking", url: "https://www.justfly.com" }],
    place: PLACES.cuz,
    dayIdxs: [11],
  },
  {
    id: "boliviana",
    title: "Boliviana de Aviacion · La Paz ⇄ Uyuni",
    kind: "flight",
    status: "confirmed",
    dates: "Aug 5 & Aug 7",
    timings: [
      "Out Aug 5: OB304 · LPB 8:45 AM → UYU 9:45 AM",
      "Back Aug 7: OB305 · UYU 8:40 AM → LPB 9:40 AM (rescheduled · was 10:15 AM)",
      "Aug 7: be at Uyuni airport by ~7:00 AM",
    ],
    ref: "EWZH2B · PNR BCYY4B",
    bookedVia: "JustFly · booking #299-891-102",
    notes: ["Reconfirm the OB305 time a day or two before · it already moved once"],
    links: [{ label: "Boliviana de Aviacion", url: "https://www.boa.bo" }],
    place: PLACES.lpb,
    dayIdxs: [13, 15],
  },
  {
    id: "miraflores",
    title: "Home in Miraflores (host Britt)",
    kind: "stay",
    status: "confirmed",
    dates: "Jul 23–26 · 3 nights",
    timings: ["Check in eve of Jul 23 · check out by ~11 AM Jul 26"],
    bookedVia: "Airbnb",
    notes: ["Av. 28 de Julio 639, Miraflores, Lima", "Contact the host via the Airbnb app thread"],
    links: [{ label: "Airbnb", url: "https://www.airbnb.com/trips" }],
    place: PLACES.miraflores,
    dayIdxs: [0],
  },
  {
    id: "cusco-hotel",
    title: "Cusco Hotel · first leg",
    kind: "stay",
    status: "to_confirm",
    dates: "Jul 26–30 · 4 nights",
    notes: [
      "Booked per the group chat · name, address, confirmation # and source still needed",
      "Until details land, there is nowhere to point a taxi on arrival night",
    ],
    dayIdxs: [3],
  },
  {
    id: "mapi-gardens",
    title: "Mapi Garden's Machupicchu",
    kind: "stay",
    status: "confirmed",
    dates: "Jul 30–Aug 1 · 2 nights · 2 rooms",
    ref: "6093685720",
    pin: "1485",
    bookedVia: "Booking.com",
    notes: ["Total $356", "Property phone is on the Booking.com confirmation"],
    links: [{ label: "Booking.com reservation", url: "https://secure.booking.com/myreservations.html" }],
    place: PLACES.mapiGardens,
    dayIdxs: [7],
  },
  {
    id: "rhouse",
    title: "RHOUSE Cusco",
    kind: "stay",
    status: "confirmed",
    dates: "Aug 1–3 · 2 nights · apartment",
    ref: "5057021282",
    pin: "3396",
    bookedVia: "Booking.com",
    notes: ["Total $202", "Arriving late (~10 PM Aug 1) · property phone is on the confirmation"],
    links: [{ label: "Booking.com reservation", url: "https://secure.booking.com/myreservations.html" }],
    place: PLACES.rhouse,
    dayIdxs: [9],
  },
  {
    id: "kawsay",
    title: "Kawsay Apart",
    kind: "stay",
    status: "confirmed",
    dates: "Aug 3–5 · 2 nights · two-bedroom apartment",
    ref: "5675367516",
    pin: "8052",
    bookedVia: "Booking.com",
    notes: ["Total $229", "Property phone is on the Booking.com confirmation"],
    links: [{ label: "Booking.com reservation", url: "https://secure.booking.com/myreservations.html" }],
    place: PLACES.kawsay,
    dayIdxs: [11],
  },
  {
    id: "uyuni-lodging",
    title: "Uyuni lodging",
    kind: "stay",
    status: "to_confirm",
    dates: "Aug 5–7 · 2 nights",
    notes: [
      "Likely Hotel Nido del Flamenco (the salt-flats operator is a hotel) but no room booking was shared",
      "Confirm the nights of Aug 5 and 6 in writing",
    ],
    links: [{ label: "Call Nido del Flamenco", url: "tel:+59168779297" }],
    place: PLACES.nidoFlamenco,
    dayIdxs: [13],
  },
  {
    id: "lapaz-lodging",
    title: "DREAM By Stannum Hotel",
    kind: "stay",
    status: "confirmed",
    dates: "Aug 7–9 · 2 nights · 2 rooms",
    timings: ["Check in late morning Aug 7 · leave ~12:30 AM on the night of Aug 8 for the flight home"],
    ref: "6892807553",
    pin: "7099",
    bookedVia: "Booking.com",
    notes: [
      "Total $421",
      "Ask the hotel to arrange the ~12:30 AM airport taxi for Aug 8",
      "Property phone is on the Booking.com confirmation",
    ],
    links: [{ label: "Booking.com reservation", url: "https://secure.booking.com/myreservations.html" }],
    place: PLACES.stannum,
    dayIdxs: [15],
  },
  {
    id: "machu-picchu",
    title: "Machu Picchu · Circuit 2 (2-day)",
    kind: "tour",
    status: "booked",
    dates: "Jul 30–31",
    timings: [
      "Jul 30 ~3:00 PM: meet the coordinator at the Aguas Calientes station · passports registered, tickets issued",
      "Jul 31: bus up ~1 hr before your entry time (set at pickup) · 2.5-hr guided Circuit 2 · return bus included",
    ],
    bookedVia: "Machu Picchu Center (direct)",
    notes: ["Original physical passports required for all six · strictly enforced"],
    links: [
      { label: "Call MP Center (24/7)", url: "tel:+18656224841" },
      { label: "Email MP Center", url: "mailto:MachuPicchu.Center@gmail.com" },
    ],
    place: PLACES.machuPicchu,
    dayIdxs: [7, 8],
  },
  {
    id: "rainbow-mountain",
    title: "Rainbow Mountain · 7-Color ATV tour",
    kind: "tour",
    status: "booked",
    dates: "Jul 28 · full day",
    timings: ["Pickup ~4:00–5:00 AM from the Cusco hotel", "Back in Cusco ~5:00 PM"],
    ref: "Receipt ML3526LC",
    bookedVia: "Mystic Lands Peru (direct)",
    notes: [
      "Total $420 USD · balance due on site, tips not included",
      "Includes transport, breakfast, buffet lunch, guide, ATVs + safety gear",
      "Operator contact details are on the receipt",
    ],
    place: PLACES.vinicunca,
    dayIdxs: [5],
  },
  {
    id: "salar-tour",
    title: "Salar de Uyuni · full-day tour",
    kind: "tour",
    status: "booked",
    dates: "Aug 6 · ~10:30 AM start",
    timings: ["Full day: salt flats, Incahuasi cactus island, sunset · return for dinner"],
    bookedVia: "Hotel Nido del Flamenco (direct)",
    notes: [
      "6 pax · private car with English-speaking guide · lunch, snacks and water boots included",
      "Total $450 USD · balance due on site · restrooms and attraction entry fees not included",
    ],
    links: [{ label: "Call Nido del Flamenco", url: "tel:+59168779297" }],
    place: PLACES.nidoFlamenco,
    dayIdxs: [14],
  },
];
