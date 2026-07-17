import { del, list } from "@vercel/blob";
import webpush from "web-push";

/**
 * Flattened alert schedule · KEEP IN SYNC with src/data/alerts.ts (the
 * function bundler cannot import across the api/ boundary). Only id, title,
 * audience and fireAt are needed for the digests.
 */
const alertRules = [
  { id: "bolivia-entry", title: "Confirm Bolivia entry requirements", audience: "lead", fireAt: "2026-07-09T09:00:00" },
  { id: "book-missing-stays", title: "Confirm the Uyuni room nights", audience: "lead", fireAt: "2026-07-16T09:00:00" },
  { id: "cusco-hotel-details", title: "Get Cusco first-leg hotel details", audience: "lead", fireAt: "2026-07-16T09:30:00" },
  { id: "mp-form", title: "Send the Machu Picchu Center form", audience: "lead", fireAt: "2026-07-16T10:00:00" },
  { id: "passports-packed", title: "Passports valid and packed", audience: "all", fireAt: "2026-07-22T09:00:00" },
  { id: "offline-maps", title: "Download offline Google Maps areas", audience: "all", fireAt: "2026-07-22T10:00:00" },
  { id: "checkin-avianca-out", title: "Check in: Avianca IAD to LIM", audience: "lead", fireAt: "2026-07-22T10:00:00" },
  { id: "ubers-to-iad", title: "Schedule two Ubers to IAD", audience: "lead", fireAt: "2026-07-22T18:00:00" },
  { id: "checkin-jetsmart-1", title: "JetSMART check-in opens", audience: "lead", fireAt: "2026-07-23T10:00:00" },
  { id: "altitude-meds", title: "Altitude medication timing", audience: "all", fireAt: "2026-07-24T09:00:00" },
  { id: "checkin-jetsmart-2", title: "Check in: JetSMART LIM to CUZ", audience: "lead", fireAt: "2026-07-25T10:00:00" },
  { id: "cusco-arrival", title: "Cusco tonight: take it easy", audience: "all", fireAt: "2026-07-26T18:00:00" },
  { id: "ollanta-car", title: "Arrange Cusco to Ollantaytambo car", audience: "lead", fireAt: "2026-07-26T09:00:00" },
  { id: "cash-rainbow", title: "Have $420 USD cash for tomorrow", audience: "all", fireAt: "2026-07-27T10:00:00" },
  { id: "rainbow-eve", title: "Rainbow Mountain tomorrow: prep tonight", audience: "all", fireAt: "2026-07-27T19:00:00" },
  { id: "mp-reconfirm", title: "Reconfirm Machu Picchu coordinator + train", audience: "lead", fireAt: "2026-07-28T09:00:00" },
  { id: "mp-passports-day1", title: "Bring original passports today", audience: "all", fireAt: "2026-07-30T07:00:00" },
  { id: "mp-passports-day2", title: "Passports again for Machu Picchu entry", audience: "all", fireAt: "2026-07-31T07:00:00" },
  { id: "checkin-cuz-lpb", title: "Check in: Cusco to La Paz", audience: "lead", fireAt: "2026-08-02T10:00:00" },
  { id: "lapaz-altitude", title: "La Paz altitude, round two", audience: "all", fireAt: "2026-08-03T09:00:00" },
  { id: "cash-bolivianos", title: "Get bolivianos", audience: "all", fireAt: "2026-08-03T16:00:00" },
  { id: "checkin-ob304", title: "Check in: La Paz to Uyuni (OB304)", audience: "lead", fireAt: "2026-08-04T10:00:00" },
  { id: "cash-uyuni", title: "Have $450 USD cash for tomorrow", audience: "all", fireAt: "2026-08-05T10:00:00" },
  { id: "checkin-ob305", title: "Check in: Uyuni to La Paz (OB305) · time changed", audience: "lead", fireAt: "2026-08-06T10:00:00" },
  { id: "lapaz-taxi", title: "Pre-book the La Paz airport taxi", audience: "lead", fireAt: "2026-08-07T10:00:00" },
  { id: "checkin-avianca-home", title: "Check in: Avianca LPB to IAD · red-eye", audience: "lead", fireAt: "2026-08-08T10:00:00" },
];

export const config = { maxDuration: 60 };

/**
 * Cron-triggered push digest. Hobby-plan cron is day-granular, so reminders
 * arrive as two daily digests rather than at exact minutes (the .ics export
 * covers exact-time alarms):
 *  - morning (~11:30 UTC · ~6:30 AM Peru / 7:30 AM Bolivia): today's reminders
 *  - evening (~22:30 UTC · ~5:30 PM Peru / 6:30 PM Bolivia): tomorrow preview
 */

/** Trip-local calendar date: Peru UTC-5 until Aug 3, Bolivia UTC-4 after. */
function tripLocalDate(offsetDays: number): string {
  const now = new Date();
  const utcMs = now.getTime();
  const bolivia = utcMs >= Date.parse("2026-08-03T00:00:00-05:00");
  const local = new Date(utcMs + (bolivia ? -4 : -5) * 3600_000 + offsetDays * 86_400_000);
  return local.toISOString().slice(0, 10);
}

export default async function handler(req: any, res: any) {
  const auth = req.headers?.authorization ?? "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:elysiumventuresgroup@gmail.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const which = req.query?.which === "evening" ? "evening" : "morning";
  const targetDate = which === "morning" ? tripLocalDate(0) : tripLocalDate(1);
  const due = alertRules.filter((a) => a.fireAt.slice(0, 10) === targetDate);
  if (due.length === 0) return res.status(200).json({ which, targetDate, sent: 0, reason: "nothing due" });

  const { blobs } = await list({ prefix: "push-subs/" });
  let sent = 0;
  let removed = 0;

  for (const blob of blobs) {
    try {
      const stored = await fetch(blob.url).then((r) => r.json());
      const audience: string = stored.audience === "lead" ? "lead" : "all";
      const mine = due.filter((a) => a.audience === "all" || audience === "lead");
      if (mine.length === 0) continue;

      const shown = mine.slice(0, 4).map((a) => a.title);
      const extra = mine.length - shown.length;
      const payload = JSON.stringify({
        title: which === "morning" ? `Today: ${mine.length} trip reminder${mine.length === 1 ? "" : "s"}` : "Heads up for tomorrow",
        body: shown.join("\n") + (extra > 0 ? `\nand ${extra} more in the app` : ""),
        url: "/",
      });
      await webpush.sendNotification(stored.subscription, payload);
      sent++;
    } catch (err: any) {
      // 404/410 · the subscription is dead, clean it up
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        try {
          await del(blob.url);
          removed++;
        } catch {}
      }
    }
  }

  return res.status(200).json({ which, targetDate, due: due.length, subs: blobs.length, sent, removed });
}
