"use client";

import { useCallback, useEffect, useState } from "react";
import { alertRules, type AlertRule } from "@/data/alerts";
import { localISO } from "@/lib/useToday";
import type { View } from "@/lib/useView";

const DONE_KEY = "trip.alerts.done";

export type AlertGroupKey = "today" | "next48" | "upcoming" | "done";

export interface AlertGroups {
  today: AlertRule[];
  next48: AlertRule[];
  upcoming: AlertRule[];
  done: AlertRule[];
}

function readDone(): Set<string> {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * The alert feed: rules filtered by audience, grouped by when they fire
 * relative to the device clock, with a per-device done set (localStorage).
 * Everything is computed on-device · zero network.
 */
export function useAlerts(view: View): {
  groups: AlertGroups;
  /** Undone alerts due today or overdue · the header badge count. */
  badge: number;
  isDone: (id: string) => boolean;
  toggleDone: (id: string) => void;
  ready: boolean;
} {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(readDone());
    setReady(true);
  }, []);

  const toggleDone = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const isDone = useCallback((id: string) => done.has(id), [done]);

  const visible = alertRules.filter((a) => a.audience === "all" || view === "lead");

  const now = new Date();
  const todayISO = localISO(now);
  const in48h = new Date(now.getTime() + 48 * 3600_000);

  const groups: AlertGroups = { today: [], next48: [], upcoming: [], done: [] };
  for (const a of visible) {
    if (done.has(a.id)) {
      groups.done.push(a);
    } else if (a.fireAt.slice(0, 10) <= todayISO) {
      groups.today.push(a); // due today or overdue
    } else if (new Date(a.fireAt) <= in48h) {
      groups.next48.push(a);
    } else {
      groups.upcoming.push(a);
    }
  }
  for (const key of Object.keys(groups) as AlertGroupKey[]) {
    groups[key].sort((x, y) => x.fireAt.localeCompare(y.fireAt));
  }

  return { groups, badge: ready ? groups.today.length : 0, isDone, toggleDone, ready };
}
