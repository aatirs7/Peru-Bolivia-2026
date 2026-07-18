import { del, list, put } from "@vercel/blob";

export const config = { maxDuration: 15 };

/**
 * Per-day edit overlays from the trip lead. Each day the lead changes is
 * stored as one blob (`dayedits/<dayIdx>.json`) holding the overridden
 * fields. Local-first on the device; this endpoint is the sync target so
 * edits reach the developer and the lead's other devices.
 */

const cleanIdx = (v: unknown): number | null =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) < 100 ? (v as number) : null;

export default async function handler(req: any, res: any) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: "storage not connected · link the peru-push-subs Blob store to the project and redeploy" });
  }

  if (req.method === "GET") {
    const { blobs } = await list({ prefix: "dayedits/" });
    const items = await Promise.all(
      blobs.map((b) => fetch(b.url).then((r) => r.json()).catch(() => null)),
    );
    return res.status(200).json({ overrides: items.filter(Boolean) });
  }

  if (req.method === "POST") {
    const { op, override, dayIdx } = req.body ?? {};

    if (op === "put") {
      const idx = cleanIdx(override?.dayIdx);
      if (idx === null) return res.status(400).json({ error: "bad override" });
      const record = {
        dayIdx: idx,
        title: typeof override.title === "string" ? override.title.slice(0, 200) : undefined,
        route: typeof override.route === "string" ? override.route.slice(0, 60) : undefined,
        warn: typeof override.warn === "string" ? override.warn.slice(0, 800) : undefined,
        note: typeof override.note === "string" ? override.note.slice(0, 800) : undefined,
        schedule: Array.isArray(override.schedule) ? override.schedule.slice(0, 60) : undefined,
        cards: Array.isArray(override.cards) ? override.cards.slice(0, 40) : undefined,
        updatedAt: new Date().toISOString(),
      };
      await put(`dayedits/${idx}.json`, JSON.stringify(record), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true });
    }

    if (op === "delete") {
      const idx = cleanIdx(dayIdx);
      if (idx === null) return res.status(400).json({ error: "bad dayIdx" });
      try {
        await del(`dayedits/${idx}.json`);
      } catch {}
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "bad op" });
  }

  return res.status(405).json({ error: "GET or POST" });
}
