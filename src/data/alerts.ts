import { trip } from "./trip";

export type AlertCategory =
  | "flight"
  | "tour"
  | "health"
  | "logistics"
  | "cash"
  | "docs"
  | "booking";

export type Audience = "all" | "lead";

export interface AlertRule {
  id: string;
  title: string;
  body: string;
  category: AlertCategory;
  /** lead-only items are hidden in Family view and family calendar exports. */
  audience: Audience;
  priority: "normal" | "high";
  /** Local ISO datetime (no timezone suffix · fires at device-local time). */
  fireAt: string;
  /** Optional deep link: tel:, mailto:, or a maps URL. Text-only affordance. */
  action?: { label: string; href: string };
  /** Optional in-app jump to the related day (0-based index). */
  dayIdx?: number;
}

/** trip.start plus n days, as YYYY-MM-DD (local, no UTC drift). */
function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

const day = (i: number) => trip.days[i].date; // 0-based itinerary day
const at = (dateISO: string, time: string) => `${dateISO}T${time}:00`;

const MP_MAIL = "mailto:MachuPicchu.Center@gmail.com";

/**
 * Alert rules derived from the itinerary. Offsets are relative to trip dates,
 * so they recompute if `trip.ts` dates ever change.
 */
export const alertRules: AlertRule[] = [
  // ---- pre-trip / prep ----------------------------------------------------
  {
    id: "bolivia-entry",
    title: "Confirm Bolivia entry requirements",
    body: "Check current entry requirements for US passports (visa on arrival rules change). You cross into Bolivia on Aug 3.",
    category: "docs",
    audience: "lead",
    priority: "high",
    fireAt: at(addDays(trip.start, -14), "09:00"),
    dayIdx: 11,
  },
  {
    id: "book-missing-stays",
    title: "Confirm the Uyuni room nights",
    body: "Uyuni Aug 5 to 7 is still unconfirmed (likely Hotel Nido del Flamenco). La Paz Aug 7 to 9 is now booked at DREAM By Stannum.",
    category: "booking",
    audience: "lead",
    priority: "high",
    fireAt: at(addDays(trip.start, -7), "09:00"),
    dayIdx: 15,
  },
  {
    id: "cusco-hotel-details",
    title: "Get Cusco first-leg hotel details",
    body: "Jul 26 to 30 was booked per the group chat but the name, address and confirmation number were never shared. Chase them down.",
    category: "booking",
    audience: "lead",
    priority: "normal",
    fireAt: at(addDays(trip.start, -7), "09:30"),
    dayIdx: 3,
  },
  {
    id: "ollanta-car",
    title: "Arrange Cusco to Ollantaytambo car",
    body: "The train leaves from Ollantaytambo, about 2 hours from Cusco. You need a car or colectivo out on Jul 30 and back on Aug 1.",
    category: "logistics",
    audience: "lead",
    priority: "normal",
    fireAt: at(day(3), "09:00"),
    dayIdx: 7,
  },
  {
    id: "lapaz-taxi",
    title: "Pre-book the La Paz airport taxi",
    body: "The flight home leaves 3:25 AM on Aug 9, so you need a ~12:30 AM pickup on the night of Aug 8. Arrange it with DREAM By Stannum or a registered taxi.",
    category: "logistics",
    audience: "lead",
    priority: "normal",
    fireAt: at(day(15), "10:00"),
    dayIdx: 17,
  },
  {
    id: "offline-maps",
    title: "Download offline Google Maps areas",
    body: "In Google Maps: profile, Offline maps, download Lima, Cusco, Aguas Calientes, La Paz and Uyuni before you lose signal.",
    category: "logistics",
    audience: "all",
    priority: "normal",
    fireAt: at(addDays(trip.start, -1), "10:00"),
  },
  {
    id: "passports-packed",
    title: "Passports valid and packed",
    body: "Everyone's original physical passport, packed where you can reach it. Machu Picchu will not accept photocopies or photos.",
    category: "docs",
    audience: "all",
    priority: "high",
    fireAt: at(addDays(trip.start, -1), "09:00"),
  },

  {
    id: "ubers-to-iad",
    title: "Schedule two Ubers to IAD",
    body: "Six travelers plus luggage need two cars. Reserve both tonight for a ~3:30 AM pickup tomorrow · you want to be at Dulles by 3:50 AM for the 6:50 AM flight.",
    category: "logistics",
    audience: "lead",
    priority: "high",
    fireAt: at(addDays(trip.start, -1), "18:00"),
    dayIdx: 0,
  },

  // ---- flight check-ins ---------------------------------------------------
  {
    id: "checkin-avianca-out",
    title: "Check in: Avianca IAD to LIM",
    body: "Departs 6:50 AM tomorrow (Jul 23) via Bogota. Conf BANUIE. Arrive at Dulles ~3 hours early.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(addDays(trip.start, -1), "10:00"),
    dayIdx: 0,
  },
  {
    id: "checkin-jetsmart-1",
    title: "JetSMART check-in opens",
    body: "LIM to CUZ on Jul 26, flight JA7041, code R9UF3G. Check-in opens today per the booking.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(0), "10:00"),
    dayIdx: 3,
  },
  {
    id: "checkin-jetsmart-2",
    title: "Check in: JetSMART LIM to CUZ",
    body: "Flight JA7041 departs 6:50 PM tomorrow (Jul 26). Code R9UF3G, 6 passengers, fully paid.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(2), "10:00"),
    dayIdx: 3,
  },
  {
    id: "checkin-cuz-lpb",
    title: "Check in: Cusco to La Paz",
    body: "Departs 12:30 PM tomorrow (Aug 3). Conf BCL2SZ, JustFly booking 299-889-112.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(10), "10:00"),
    dayIdx: 11,
  },
  {
    id: "checkin-ob304",
    title: "Check in: La Paz to Uyuni (OB304)",
    body: "Departs 8:45 AM tomorrow (Aug 5). Conf EWZH2B, PNR BCYY4B. Early start from Kawsay Apart.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(12), "10:00"),
    dayIdx: 13,
  },
  {
    id: "checkin-ob305",
    title: "Check in: Uyuni to La Paz (OB305) · time changed",
    body: "The departure moved to 8:40 AM (was 10:15). Reconfirm the time and be at the airport by ~7:00 AM on Aug 7. PNR BCYY4B.",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(14), "10:00"),
    dayIdx: 15,
  },
  {
    id: "checkin-avianca-home",
    title: "Check in: Avianca LPB to IAD · red-eye",
    body: "Departs 3:25 AM tonight, technically Aug 9. Leave the lodging ~12:30 AM, set multiple alarms. Conf BANUIE. Bogota connection is tight (1h 30m).",
    category: "flight",
    audience: "lead",
    priority: "high",
    fireAt: at(day(16), "10:00"),
    dayIdx: 17,
  },

  // ---- Machu Picchu -------------------------------------------------------
  {
    id: "mp-form",
    title: "Send the Machu Picchu Center form",
    body: "Send your email and the Aguas Calientes hotel (Mapi Garden's) to Machu Picchu Center so they can issue the vouchers.",
    category: "tour",
    audience: "lead",
    priority: "high",
    fireAt: at(addDays(trip.start, -7), "10:00"),
    action: { label: "Email MP Center", href: MP_MAIL },
    dayIdx: 7,
  },
  {
    id: "mp-reconfirm",
    title: "Reconfirm Machu Picchu coordinator + train",
    body: "Two days before arrival: reconfirm the station meeting point, your train (Vistadome 303, 1:27 PM) and passport registration. 24/7 line +1 865 622 4841.",
    category: "tour",
    audience: "lead",
    priority: "high",
    fireAt: at(day(5), "09:00"),
    action: { label: "Email MP Center", href: MP_MAIL },
    dayIdx: 7,
  },
  {
    id: "mp-passports-day1",
    title: "Bring original passports today",
    body: "Passport registration happens at the Aguas Calientes station this afternoon. Originals only, for all six travelers.",
    category: "docs",
    audience: "all",
    priority: "high",
    fireAt: at(day(7), "07:00"),
    dayIdx: 7,
  },
  {
    id: "mp-passports-day2",
    title: "Passports again for Machu Picchu entry",
    body: "Original physical passports are checked at the citadel entrance. Strictly enforced.",
    category: "docs",
    audience: "all",
    priority: "high",
    fireAt: at(day(8), "07:00"),
    dayIdx: 8,
  },

  // ---- health / altitude --------------------------------------------------
  {
    id: "altitude-meds",
    title: "Altitude medication timing",
    body: "If anyone was prescribed Diamox/acetazolamide, it is typically started 1 to 2 days before ascending. You reach Cusco (3,400 m) on Jul 26. Follow your doctor's guidance.",
    category: "health",
    audience: "all",
    priority: "normal",
    fireAt: at(day(1), "09:00"),
  },
  {
    id: "cusco-arrival",
    title: "Cusco tonight: take it easy",
    body: "You land at 3,400 m. Hydrate, coca tea, light dinner, no heavy exertion tonight.",
    category: "health",
    audience: "all",
    priority: "normal",
    fireAt: at(day(3), "18:00"),
    dayIdx: 3,
  },
  {
    id: "rainbow-eve",
    title: "Rainbow Mountain tomorrow: prep tonight",
    body: "Pickup is ~4 AM. Hydrate, lay out warm layers, trekking shoes, sunscreen, hat, water, and cash for horse rental or snacks. It tops 5,000 m.",
    category: "health",
    audience: "all",
    priority: "normal",
    fireAt: at(day(4), "19:00"),
    dayIdx: 5,
  },
  {
    id: "lapaz-altitude",
    title: "La Paz altitude, round two",
    body: "La Paz sits at ~3,600 m and El Alto airport at ~4,060 m. Same drill: hydrate and take the first day easy.",
    category: "health",
    audience: "all",
    priority: "normal",
    fireAt: at(day(11), "09:00"),
    dayIdx: 11,
  },

  // ---- cash due on site ---------------------------------------------------
  {
    id: "cash-rainbow",
    title: "Have $420 USD cash for tomorrow",
    body: "Rainbow Mountain balance is due on site (receipt ML3526LC). Tips not included; small notes help.",
    category: "cash",
    audience: "all",
    priority: "normal",
    fireAt: at(day(4), "10:00"),
    dayIdx: 5,
  },
  {
    id: "cash-uyuni",
    title: "Have $450 USD cash for tomorrow",
    body: "Salar de Uyuni tour balance is due on site, plus small notes for restrooms and attraction entry fees.",
    category: "cash",
    audience: "all",
    priority: "normal",
    fireAt: at(day(12), "10:00"),
    dayIdx: 14,
  },
  {
    id: "cash-bolivianos",
    title: "Get bolivianos",
    body: "You just landed in Bolivia. Withdraw or exchange enough bolivianos for taxis, food and small fees.",
    category: "cash",
    audience: "all",
    priority: "normal",
    fireAt: at(day(11), "16:00"),
    dayIdx: 11,
  },
];
