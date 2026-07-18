"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Revision {
  id: string;
  /** What to change, in the lead's words. */
  text: string;
  /** Optional location hint, e.g. "Day 8" or "Bookings page". */
  where: string;
  priority: "normal" | "important";
  status: "open" | "done";
  createdAt: string;
  updatedAt: string;
  /** Not yet confirmed by the server (offline or sync failed). */
  dirty?: boolean;
  /** Deleted locally, deletion not yet synced. */
  deleted?: boolean;
}

const KEY = "trip.revisions";

function load(): Revision[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: Revision[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `rev-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/**
 * Local-first revision reports. Every change lands in localStorage instantly
 * (works with zero connectivity); a best-effort sync pushes dirty items and
 * pulls the server list whenever we're online. The app never blocks on it.
 */
export function useRevisions(): {
  revisions: Revision[];
  syncing: boolean;
  pendingCount: number;
  add: (text: string, where: string, priority: "normal" | "important") => void;
  setStatus: (id: string, status: "open" | "done") => void;
  remove: (id: string) => void;
  sync: () => Promise<void>;
} {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  // synchronous read-modify-write so a following sync() always sees the change
  const mutate = useCallback((fn: (prev: Revision[]) => Revision[]) => {
    const next = fn(load());
    save(next);
    setRevisions(next);
  }, []);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      // push dirty writes and deletions, best effort
      const syncedIds = new Set<string>();
      const deletedIds = new Set<string>();
      for (const r of load().filter((x) => x.dirty)) {
        try {
          const res = await fetch("/api/revisions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              r.deleted
                ? { op: "delete", id: r.id }
                : { op: "put", revision: { ...r, dirty: undefined, deleted: undefined } },
            ),
          });
          if (res.ok) {
            if (r.deleted) deletedIds.add(r.id);
            else syncedIds.add(r.id);
          }
        } catch {
          // stay dirty · retried on the next sync
        }
      }

      // apply push results to a FRESH read (new items may have landed meanwhile)
      let cur = load()
        .map((r) => (syncedIds.has(r.id) ? { ...r, dirty: false } : r))
        .filter((r) => !deletedIds.has(r.id));
      save(cur);

      // pull the server list and merge (local dirty items win)
      let serverItems: Revision[] | null = null;
      try {
        const res = await fetch("/api/revisions");
        if (res.ok) serverItems = (await res.json()).revisions ?? null;
      } catch {}

      if (serverItems) {
        cur = load();
        const dirtyLocal = cur.filter((x) => x.dirty);
        const dirtyIds = new Set(dirtyLocal.map((x) => x.id));
        const merged = [...serverItems.filter((s) => !dirtyIds.has(s.id)), ...dirtyLocal].filter(
          (x) => !(x.deleted && !x.dirty),
        );
        merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        save(merged);
        setRevisions(merged);
      } else {
        setRevisions(load().filter((x) => !(x.deleted && !x.dirty)));
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    setRevisions(load());
    void sync();
    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [sync]);

  const add = useCallback(
    (text: string, where: string, priority: "normal" | "important") => {
      const now = new Date().toISOString();
      mutate((prev) => [
        {
          id: newId(),
          text: text.trim(),
          where: where.trim(),
          priority,
          status: "open" as const,
          createdAt: now,
          updatedAt: now,
          dirty: true,
        },
        ...prev,
      ]);
      void sync();
    },
    [mutate, sync],
  );

  const setStatus = useCallback(
    (id: string, status: "open" | "done") => {
      mutate((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, updatedAt: new Date().toISOString(), dirty: true } : r,
        ),
      );
      void sync();
    },
    [mutate, sync],
  );

  const remove = useCallback(
    (id: string) => {
      mutate((prev) =>
        prev.map((r) => (r.id === id ? { ...r, deleted: true, dirty: true } : r)),
      );
      void sync();
    },
    [mutate, sync],
  );

  const pendingCount = revisions.filter((r) => r.dirty).length;

  return { revisions: revisions.filter((r) => !r.deleted), syncing, pendingCount, add, setStatus, remove, sync };
}
