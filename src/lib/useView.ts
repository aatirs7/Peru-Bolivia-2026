"use client";

import { useCallback, useEffect, useState } from "react";

export type View = "family" | "lead";

const KEY = "trip.view";

/** Per-device Family / Trip-Lead view, persisted in localStorage. */
export function useView(): [View, (v: View) => void] {
  const [view, setViewState] = useState<View>("family");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "lead" || saved === "family") setViewState(saved);
    } catch {
      // storage unavailable (private mode) — stay on the in-memory default
    }
  }, []);

  const setView = useCallback((v: View) => {
    setViewState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  }, []);

  return [view, setView];
}
