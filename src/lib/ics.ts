import { alertRules } from "@/data/alerts";
import type { View } from "@/lib/useView";

/** Escape ICS text values (RFC 5545). */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Fold lines longer than 74 octets with a leading space (RFC 5545 3.1). */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

/** "2026-07-22T10:00:00" → floating local "20260722T100000" (fires device-local). */
const toIcsTime = (iso: string) => iso.replace(/[-:]/g, "");

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Build the trip-reminders calendar for the current view (Family exports only
 * the shared alerts; Trip Lead exports everything). Each event carries a
 * VALARM at the reminder moment, so the phone's native calendar fires an
 * OS-level notification · fully offline after a one-time import.
 */
export function buildIcs(view: View): string {
  const rules = alertRules.filter((a) => a.audience === "all" || view === "lead");
  const d = new Date();
  const stamp = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Siddiqui Family//Peru Bolivia 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold("X-WR-CALNAME:" + esc("Peru & Bolivia 2026 · Trip Reminders")),
  ];

  for (const a of rules) {
    const start = toIcsTime(a.fireAt);
    // 30-minute event window; the alarm fires at the event start
    const [datePart] = a.fireAt.split("T");
    const [y, m, dd] = datePart.split("-").map(Number);
    const [hh, mm] = a.fireAt.split("T")[1].split(":").map(Number);
    const endDate = new Date(y, m - 1, dd, hh, mm + 30);
    const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
    const desc = a.action ? `${a.body}\n${a.action.label}: ${a.action.href}` : a.body;

    lines.push(
      "BEGIN:VEVENT",
      fold(`UID:${a.id}@peru-bolivia-2026`),
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      fold("SUMMARY:" + esc(a.title)),
      fold("DESCRIPTION:" + esc(desc)),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      fold("DESCRIPTION:" + esc(a.title)),
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Client-side download of the .ics · a Blob URL, no network involved. */
export function downloadIcs(view: View): void {
  const blob = new Blob([buildIcs(view)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "peru-bolivia-2026-reminders.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
