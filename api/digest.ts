import { del, list } from "@vercel/blob";
import webpush from "web-push";
import { alertRules } from "../src/data/alerts";

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
