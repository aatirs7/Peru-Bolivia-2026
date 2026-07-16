"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "trip.theme";

/**
 * Per-device dark mode, persisted in localStorage. Defaults to the system
 * preference until the user toggles explicitly. A tiny inline script in the
 * root layout applies the class before hydration so there is no flash.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      const dark = saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", dark);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return [theme, toggle];
}
