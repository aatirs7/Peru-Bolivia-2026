import { trip } from "./trip";

export type Severity = "critical" | "warning" | "info";

export interface Issue {
  id: string;
  severity: Severity;
  /** What needs attention. */
  what: string;
  /** Why it matters. */
  why: string;
  /** Suggested next step. */
  action: string;
  /** Related date / deadline, ISO YYYY-MM-DD (sorts within severity). */
  deadline?: string;
  /** In-app jump to the related day (0-based). */
  dayIdx?: number;
  /** Optional tel:/mailto:/maps link. */
  href?: { label: string; url: string };
  /** Card titles / day warns this curated issue already covers (dedupe keys). */
  coversCards?: string[];
  coversWarnDays?: number[];
}

/**
 * Curated issues · the seed list, with context the raw data can't carry.
 * Auto-derived items (below) fill in anything not covered here so the page
 * can never drift from `trip.ts`.
 */
export const curatedIssues: Issue[] = [
  {
    id: "uyuni-lodging",
    severity: "critical",
    what: "Uyuni lodging Aug 5 to 7 is unconfirmed",
    why: "The salt-flats operator is probably also the hotel (Nido del Flamenco), but no room booking was ever shared.",
    action: "Call or WhatsApp +591 687 79297 and confirm the nights of Aug 5 and 6 in writing.",
    deadline: "2026-08-05",
    dayIdx: 13,
    href: { label: "Call Nido del Flamenco", url: "tel:+59168779297" },
    coversCards: ["Uyuni lodging (Aug 5 → Aug 7, 2 nights)"],
  },
  {
    id: "cusco-hotel-details",
    severity: "warning",
    what: "Cusco first-leg hotel details missing",
    why: "Jul 26 to 30 is supposedly booked but there is no name, address or confirmation number · nowhere to point a taxi on landing.",
    action: "Get the confirmation screenshot from the group chat sender and fill in trip data + contacts.",
    deadline: "2026-07-26",
    dayIdx: 3,
    coversCards: ["Cusco Hotel · first leg"],
  },
  {
    id: "ollanta-transfers",
    severity: "warning",
    what: "Cusco to Ollantaytambo transfers not booked",
    why: "The Machu Picchu trains start and end in Ollantaytambo, ~2 hours from Cusco. Jul 30 outbound must arrive before the 1:27 PM train.",
    action: "Book a private car or colectivo for Jul 30 morning and Aug 1 evening (~10 PM return to Cusco).",
    deadline: "2026-07-30",
    dayIdx: 7,
    coversCards: [
      "Cusco → Ollantaytambo ground transport",
      "Ollantaytambo → Cusco ground transport",
    ],
  },
  {
    id: "bog-layover",
    severity: "warning",
    what: "1h 30m Bogota layover on the return",
    why: "JustFly flagged it as tight for an international transfer at 4-5 AM.",
    action: "Look up the usual BOG arrival/departure gates ahead of time and plan to move fast; no checked-bag dawdling.",
    deadline: "2026-08-09",
    dayIdx: 17,
    coversWarnDays: [17],
  },
  {
    id: "lapaz-3am-pickup",
    severity: "warning",
    what: "3:25 AM Aug 9 departure needs a pre-arranged pickup",
    why: "You leave the lodging around 12:30 AM; street taxis at that hour are unreliable and unsafe.",
    action: "Pre-book the ~12:30 AM airport taxi through DREAM By Stannum for the night of Aug 8.",
    deadline: "2026-08-08",
    dayIdx: 16,
    coversWarnDays: [16],
  },
  {
    id: "ob305-time-change",
    severity: "warning",
    what: "Uyuni to La Paz moved to 8:40 AM (was 10:15)",
    why: "Airline reschedules sometimes move again; missing it strands you a day before the flight home.",
    action: "Reconfirm OB305's departure time (PNR BCYY4B) a day or two before Aug 7.",
    deadline: "2026-08-06",
    dayIdx: 15,
  },
  {
    id: "mp-passports",
    severity: "info",
    what: "Original passports required for Machu Picchu",
    why: "Registration at the Aguas Calientes station (Jul 30) and the citadel entrance (Jul 31) both check physical passports · strictly enforced.",
    action: "All six passports packed and carried on Jul 30 and 31.",
    deadline: "2026-07-30",
    dayIdx: 7,
    coversWarnDays: [7, 8],
  },
  {
    id: "seats-unassigned",
    severity: "info",
    what: "Per-passenger seats not yet assigned",
    why: "The confirmations shared did not include seat assignments for any leg.",
    action: "Assign or verify seats for all six travelers at each check-in.",
    deadline: "2026-07-22",
  },
  {
    id: "bolivia-entry",
    severity: "info",
    what: "Confirm Bolivia entry for US passports",
    why: "Entry rules (visa on arrival, fees, photos) change; the family crosses on Aug 3 at El Alto.",
    action: "Check the current requirements and carry any required fee in USD cash.",
    deadline: "2026-08-03",
    dayIdx: 11,
    coversWarnDays: [11],
  },
];

/**
 * Everything needing attention: curated issues plus auto-derived items for
 * any gap / to_confirm card or day warn the curated list doesn't cover.
 */
export function deriveIssues(): Issue[] {
  const coveredCards = new Set(curatedIssues.flatMap((i) => i.coversCards ?? []));
  const coveredWarns = new Set(curatedIssues.flatMap((i) => i.coversWarnDays ?? []));
  const auto: Issue[] = [];

  trip.days.forEach((d, di) => {
    for (const card of d.cards) {
      if ((card.status === "gap" || card.status === "to_confirm") && !coveredCards.has(card.title)) {
        auto.push({
          id: `auto-card-${di}-${card.title}`,
          severity: card.status === "gap" ? "critical" : "warning",
          what: card.title,
          why: card.lines.join(" · "),
          action: card.status === "gap" ? "Book it and update trip data." : "Confirm the details and update trip data.",
          deadline: d.date,
          dayIdx: di,
        });
      }
    }
    if (d.warn && !coveredWarns.has(di)) {
      auto.push({
        id: `auto-warn-${di}`,
        severity: "info",
        what: `Day ${d.index} note: ${d.route}`,
        why: d.warn,
        action: "Read the day's warning and plan accordingly.",
        deadline: d.date,
        dayIdx: di,
      });
    }
  });

  const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return [...curatedIssues, ...auto].sort(
    (a, b) => order[a.severity] - order[b.severity] || (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"),
  );
}
