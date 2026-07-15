"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "trip.name";

/**
 * Per-device traveler name for the greeting, persisted in localStorage.
 * `name` is null until chosen (or if storage is unavailable) — the greeting
 * falls back to a neutral "Welcome!" in that case.
 */
export function useName(): [string | null, (n: string | null) => void] {
  const [name, setNameState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setNameState(saved);
    } catch {}
  }, []);

  const setName = useCallback((n: string | null) => {
    setNameState(n);
    try {
      if (n) localStorage.setItem(KEY, n);
      else localStorage.removeItem(KEY);
    } catch {}
  }, []);

  return [name, setName];
}
