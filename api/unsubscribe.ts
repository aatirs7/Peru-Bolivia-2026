import { del } from "@vercel/blob";
import { subId } from "./subscribe";

export const config = { maxDuration: 10 };

export default async function handler(req: any, res: any) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: "storage not connected" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { endpoint } = req.body ?? {};
  if (typeof endpoint !== "string" || !endpoint) {
    return res.status(400).json({ error: "endpoint required" });
  }
  try {
    await del(`push-subs/${subId(endpoint)}.json`);
  } catch {
    // already gone · fine
  }
  return res.status(200).json({ ok: true });
}
