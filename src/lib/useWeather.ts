"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Coords, WeatherSnapshot } from "@/types";

const KEY = "trip.weather";
const STALE_MS = 6 * 60 * 60 * 1000; // ~6 hours

/** WMO weather_code → condition text + line-icon key (mapped to lucide in the UI). */
function describe(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear", icon: "sun" };
  if (code === 1) return { condition: "Mostly clear", icon: "sun-cloud" };
  if (code === 2) return { condition: "Partly cloudy", icon: "sun-cloud" };
  if (code === 3) return { condition: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { condition: "Fog", icon: "fog" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 67) return { condition: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { condition: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { condition: "Showers", icon: "rain" };
  if (code === 85 || code === 86) return { condition: "Snow showers", icon: "snow" };
  if (code >= 95) return { condition: "Thunderstorm", icon: "storm" };
  return { condition: "Weather", icon: "thermometer" };
}

const toF = (c: number) => Math.round((c * 9) / 5 + 32);

function readCache(): WeatherSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherSnapshot;
    return typeof parsed?.tempC === "number" && parsed?.fetchedAt ? parsed : null;
  } catch {
    return null;
  }
}

export interface WeatherState {
  snapshot: WeatherSnapshot | null;
  /** True when the snapshot is >6h old or we're offline · show the "as of" note. */
  stale: boolean;
  offline: boolean;
}

/**
 * Offline-first, cache-then-refresh weather for today's itinerary city.
 *
 * - Renders the last cached value immediately; never blocks on the network.
 * - If online, background-fetches Open-Meteo (keyless, CORS-friendly) and
 *   updates UI + cache; failures silently keep the cached value.
 * - Auto-refreshes the moment connectivity returns (the `online` event) and
 *   when the tab regains focus. No timers, no polling.
 */
export function useWeather(coords: Coords): WeatherState {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [offline, setOffline] = useState(false);
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  const refresh = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const { lat, lng, label } = coordsRef.current;
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto&forecast_days=1`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const tempC = Math.round(data?.current?.temperature_2m);
      const hiC = Math.round(data?.daily?.temperature_2m_max?.[0]);
      const loC = Math.round(data?.daily?.temperature_2m_min?.[0]);
      const code = Number(data?.current?.weather_code ?? -1);
      if (!Number.isFinite(tempC)) return;
      const { condition, icon } = describe(code);
      const snap: WeatherSnapshot = {
        locationName: label,
        tempC,
        tempF: toF(tempC),
        hiC,
        loC,
        hiF: toF(hiC),
        loF: toF(loC),
        condition,
        icon,
        fetchedAt: new Date().toISOString(),
      };
      setSnapshot(snap);
      try {
        localStorage.setItem(KEY, JSON.stringify(snap));
      } catch {}
    } catch {
      // offline / blocked / API down · keep showing the cached value
    }
  }, []);

  // Mount: cached value first, then a background refresh.
  useEffect(() => {
    setSnapshot(readCache());
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    void refresh();
  }, [refresh]);

  // Refetch when the itinerary city changes (day flips to a new location).
  useEffect(() => {
    void refresh();
  }, [coords.label, refresh]);

  // Auto-refresh the moment wifi returns; track offline state; re-check on focus.
  useEffect(() => {
    const onOnline = () => {
      setOffline(false);
      void refresh();
    };
    const onOffline = () => setOffline(true);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const stale =
    !!snapshot &&
    (offline || Date.now() - new Date(snapshot.fetchedAt).getTime() > STALE_MS);

  return { snapshot, stale, offline };
}

/** "2h ago" / "just now" for the staleness note. */
export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 2) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}
