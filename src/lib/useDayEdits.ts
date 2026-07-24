"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trip } from "@/data/trip";
import type { BookingCard, Day, ScheduleItem } from "@/types";

/** The lead's overrides for one day. Undefined fields fall through to base. */
export interface DayOverride {
  dayIdx: number;
  title?: string;
  route?: string;
  /** "" = warning cleared. */
  warn?: string;
  /** "" = note cleared. */
  note?: string;
  schedule?: ScheduleItem[];
  cards?: BookingCard[];
  updatedAt: string;
  dirty?: boolean;
}

const KEY = "trip.dayedits";

function loadMap(): Record<number, DayOverride> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persist the overlay. If a write would drop days that were here before, the
 * previous map is snapshotted to `trip.dayedits.bak` first · a sync bug must
 * never be able to destroy the lead's typed-in plan.
 */
function saveMap(m: Record<number, DayOverride>) {
  try {
    const prev = loadMap();
    const lost = Object.keys(prev).filter((k) => !(k in m));
    if (lost.length > 0) localStorage.setItem(`${KEY}.bak`, JSON.stringify(prev));
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {}
}

/** Merge a base day with the lead's override (override wins field by field). */
export function mergeDay(base: Day, ov?: DayOverride): Day {
  if (!ov) return base;
  const clear = (v: string | undefined) => (v && v.trim() ? v : undefined);
  return {
    ...base,
    title: ov.title?.trim() ? ov.title : base.title,
    route: ov.route?.trim() ? ov.route : base.route,
    warn: ov.warn !== undefined ? clear(ov.warn) : base.warn,
    note: ov.note !== undefined ? clear(ov.note) : base.note,
    schedule: ov.schedule ?? base.schedule,
    cards: ov.cards ?? base.cards,
  };
}

/** Standalone effective day · reads the overlay synchronously from storage. */
export function effectiveDay(dayIdx: number): Day {
  return mergeDay(trip.days[dayIdx], loadMap()[dayIdx]);
}

/**
 * Local-first day-edit overlays for the trip lead. Edits save to this device
 * instantly (offline-safe) and sync to the server when wifi returns.
 */
export function useDayEdits(): {
  overrides: Record<number, DayOverride>;
  syncing: boolean;
  pendingCount: number;
  effective: (dayIdx: number) => Day;
  saveDay: (dayIdx: number, patch: Omit<DayOverride, "dayIdx" | "updatedAt" | "dirty">) => void;
  resetDay: (dayIdx: number) => void;
} {
  const [overrides, setOverrides] = useState<Record<number, DayOverride>>({});
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const syncedIdx = new Set<number>();
      const deletedIdx = new Set<number>();
      const cur = loadMap();
      for (const ov of Object.values(cur).filter((x) => x.dirty)) {
        try {
          const isDelete = !ov.schedule && !ov.cards && !ov.title && !ov.route && !ov.warn && !ov.note;
          const res = await fetch("/api/dayedits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              isDelete
                ? { op: "delete", dayIdx: ov.dayIdx }
                : { op: "put", override: { ...ov, dirty: undefined } },
            ),
          });
          if (res.ok) (isDelete ? deletedIdx : syncedIdx).add(ov.dayIdx);
        } catch {
          // stay dirty · retried next sync
        }
      }

      const afterPush = loadMap();
      deletedIdx.forEach((idx) => delete afterPush[idx]);
      saveMap(afterPush);

      // pull the server list · the lead's saved plan is the source of truth
      let serverList: DayOverride[] | null = null;
      try {
        const res = await fetch("/api/dayedits", { cache: "no-store" });
        if (res.ok) serverList = (await res.json()).overrides ?? null;
      } catch {}

      let merged = afterPush;
      if (serverList) {
        merged = { ...afterPush };
        for (const s of serverList) {
          // an edit stays dirty until the server actually reads it back ·
          // list() is eventually consistent, so "POST returned ok" is not
          // proof the day is stored, and clearing dirty early risks losing it
          if (syncedIdx.has(s.dayIdx)) merged[s.dayIdx] = { ...s, dirty: false };
          else if (!merged[s.dayIdx]?.dirty) merged[s.dayIdx] = { ...s, dirty: false };
        }
        saveMap(merged);
      }
      setOverrides(merged);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    setOverrides(loadMap());
    void sync();
    // refresh when wifi returns and whenever the app is brought back to the
    // foreground, so a family phone left open still picks up the lead's edits
    const onOnline = () => void sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sync]);

  const saveDay = useCallback(
    (dayIdx: number, patch: Omit<DayOverride, "dayIdx" | "updatedAt" | "dirty">) => {
      const m = loadMap();
      m[dayIdx] = { dayIdx, ...patch, updatedAt: new Date().toISOString(), dirty: true };
      saveMap(m);
      setOverrides({ ...m });
      void sync();
    },
    [sync],
  );

  const resetDay = useCallback(
    (dayIdx: number) => {
      const m = loadMap();
      if (!m[dayIdx]) return;
      // keep a dirty tombstone so the deletion syncs; sync() prunes it after
      m[dayIdx] = { dayIdx, updatedAt: new Date().toISOString(), dirty: true };
      saveMap(m);
      setOverrides({ ...m });
      void sync();
    },
    [sync],
  );

  const effective = useCallback(
    (dayIdx: number) => mergeDay(trip.days[dayIdx], overrides[dayIdx]),
    [overrides],
  );

  const pendingCount = Object.values(overrides).filter((x) => x.dirty).length;

  return { overrides, syncing, pendingCount, effective, saveDay, resetDay };
}
