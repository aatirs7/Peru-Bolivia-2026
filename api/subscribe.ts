import { put } from "@vercel/blob";

export const config = { maxDuration: 10 };

/** Stable blob id per device, derived from the push endpoint. */
export function subId(endpoint: string): string {
  return Buffer.from(endpoint).toString("base64url").slice(-40);
}

export default async function handler(req: any, res: any) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: "storage not connected" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { subscription, audience } = req.body ?? {};
  if (!subscription?.endpoint || !subscription?.keys?.p256dh) {
    return res.status(400).json({ error: "bad subscription" });
  }
  await put(
    `push-subs/${subId(subscription.endpoint)}.json`,
    JSON.stringify({
      subscription,
      audience: audience === "lead" ? "lead" : "all",
      addedAt: new Date().toISOString(),
    }),
    {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    },
  );
  return res.status(200).json({ ok: true });
}
