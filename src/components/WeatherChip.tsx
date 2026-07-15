"use client";

import type { Coords } from "@/types";
import { relativeTime, useWeather } from "@/lib/useWeather";

/**
 * Cache-then-refresh weather for today's itinerary city. Purely additive —
 * renders nothing until the first successful fetch has been cached, and the
 * homepage never waits on it.
 */
export default function WeatherChip({ coords }: { coords: Coords }) {
  const { snapshot, stale, offline } = useWeather(coords);
  if (!snapshot) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/60 px-3.5 py-2.5 backdrop-blur-sm">
      <span aria-hidden className="text-[22px] leading-none">{snapshot.icon}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-ink">
          {snapshot.locationName} · {snapshot.tempC}°C / {snapshot.tempF}°F ·{" "}
          {snapshot.condition}
        </p>
        <p className="text-[11.5px] leading-tight text-ink-faint">
          H {snapshot.hiC}° / L {snapshot.loC}°C&ensp;
          <span className="text-ink-faint/80">
            (H {snapshot.hiF}° / L {snapshot.loF}°F)
          </span>
          {stale && (
            <span className="ml-1.5 text-clay-500">
              · as of {relativeTime(snapshot.fetchedAt)}
              {offline && " · offline"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
