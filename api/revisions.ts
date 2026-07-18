import { del, list, put } from "@vercel/blob";

export const config = { maxDuration: 15 };

/**
 * Revision reports from the trip lead · quick change requests typed in the
 * app, stored one blob each, read later by the developer. Local-first on the
 * device; this endpoint is the best-effort sync target.
 */

const cleanId = (id: unknown): string | null =>
  typeof id === "string" && /^[a-z0-9-]{8,64}$/.test(id) ? id : null;

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const { blobs } = await list({ prefix: "revisions/" });
    const items = await Promise.all(
      blobs.map((b) => fetch(b.url).then((r) => r.json()).catch(() => null)),
    );
    return res.status(200).json({ revisions: items.filter(Boolean) });
  }

  if (req.method === "POST") {
    const { op, revision, id } = req.body ?? {};

    if (op === "put") {
      const rid = cleanId(revision?.id);
      if (!rid || typeof revision.text !== "string" || !revision.text.trim()) {
        return res.status(400).json({ error: "bad revision" });
      }
      const record = {
        id: rid,
        text: String(revision.text).slice(0, 2000),
        where: typeof revision.where === "string" ? revision.where.slice(0, 120) : "",
        priority: revision.priority === "important" ? "important" : "normal",
        status: revision.status === "done" ? "done" : "open",
        createdAt: typeof revision.createdAt === "string" ? revision.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await put(`revisions/${rid}.json`, JSON.stringify(record), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true });
    }

    if (op === "delete") {
      const rid = cleanId(id);
      if (!rid) return res.status(400).json({ error: "bad id" });
      try {
        await del(`revisions/${rid}.json`);
      } catch {}
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "bad op" });
  }

  return res.status(405).json({ error: "GET or POST" });
}
