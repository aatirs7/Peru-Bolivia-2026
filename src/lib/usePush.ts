"use client";

import { useCallback, useEffect, useState } from "react";
import type { View } from "@/lib/useView";

/** VAPID public key · public by design, pairs with the server's private key. */
export const VAPID_PUBLIC_KEY =
  "BONayeLUt8u4X1pcWUsuSTOdtAyOoZkqt5pwZBrv2jigRDf_kVif4gNvGHvAkZ_G0VEBUYS-kxEyVEkxoKRcm9g";

export type PushState = "unsupported" | "denied" | "off" | "on" | "busy";

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

/**
 * Web Push opt-in (the one online-optional module). Subscriptions are stored
 * server-side; a Vercel cron sends morning/evening digests of the day's
 * reminders. The core app never depends on this.
 */
export function usePush(view: View): {
  state: PushState;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  sendTest: () => Promise<void>;
} {
  const [state, setState] = useState<PushState>("unsupported");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "on" : "off");
      } catch {
        setState("off");
      }
    })();
  }, []);

  const enable = useCallback(async () => {
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBuffer(VAPID_PUBLIC_KEY),
        }));
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), audience: view }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("on");
    } catch {
      setState("off");
    }
  }, [view]);

  const disable = useCallback(async () => {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("off");
    }
  }, []);

  const sendTest = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("Peru & Bolivia 2026", {
        body: "Push notifications are working on this device.",
        icon: "/icons/icon-192.png",
      });
    } catch {}
  }, []);

  return { state, enable, disable, sendTest };
}
