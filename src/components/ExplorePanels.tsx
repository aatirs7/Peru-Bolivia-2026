"use client";

import { useState } from "react";
import { DESTINATIONS } from "@/data/destinations";
import { suggestionPlace } from "@/lib/explore";
import type { Destination, SuggCategory, Suggestion } from "@/types";
import MapLink from "./MapLink";

const categoryLabel: Record<SuggCategory, string> = {
  see: "See",
  eat: "Eat",
  walk: "Walk",
  market: "Market",
  viewpoint: "Viewpoint",
  daytrip: "Day trip",
  active: "Active",
  relax: "Relax",
};

/** Index of all six destinations · browsable ahead of time by anyone. */
export function DestinationsPanel({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section aria-label="Destinations" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">Explore</h2>
      <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-snug text-ink-faint">
        Curated things to do in each place · works fully offline. Highlights
        from the plan plus ideas for free time.
      </p>
      <div className="mt-4 space-y-2.5">
        {DESTINATIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onOpen(d.id)}
            className="w-full rounded-xl border border-sand-200/70 bg-card p-4 text-center shadow-card active:bg-sand-100"
          >
            <p className="text-[15px] font-semibold tracking-tight text-ink">{d.name}</p>
            <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-clay-500">
              Day{d.dayNumbers.length > 1 ? "s" : ""} {d.dayNumbers.join(", ")}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-snug text-ink-faint">
              {d.intro.split(". ")[0]}.
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({ dest, s }: { dest: Destination; s: Suggestion }) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 text-center shadow-card ${
        s.onItinerary ? "border-clay-300/50" : "border-sand-200/70"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span className="rounded-md bg-sand-200 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
          {categoryLabel[s.category]}
        </span>
        {s.onItinerary && (
          <span className="rounded-md border border-clay-300/60 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-clay-600 dark:text-clay-300">
            On your plan
          </span>
        )}
      </div>
      <p className="mt-2 text-[14.5px] font-semibold leading-snug text-ink">{s.name}</p>
      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{s.blurb}</p>
      {s.tip && (
        <p className="mt-1.5 text-[12px] italic leading-snug text-ink-faint">Tip: {s.tip}</p>
      )}
      <div className="mt-2.5">
        <MapLink place={suggestionPlace(dest.id, s)} subtle />
      </div>
    </div>
  );
}

/** One destination's curated page: intro, practical strip, suggestions. */
export function DestinationPanel({ dest }: { dest: Destination }) {
  const [filter, setFilter] = useState<SuggCategory | "all">("all");
  const cats = Array.from(new Set(dest.suggestions.map((s) => s.category)));
  const filtered = dest.suggestions.filter((s) => filter === "all" || s.category === filter);
  const planned = filtered.filter((s) => s.onItinerary);
  const extras = filtered.filter((s) => !s.onItinerary);

  return (
    <section aria-label={`Explore ${dest.name}`} className="text-center">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
        Day{dest.dayNumbers.length > 1 ? "s" : ""} {dest.dayNumbers.join(", ")}
      </p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-ink">{dest.name}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">{dest.intro}</p>

      {(dest.altitudeNote || dest.halalNote || dest.practical?.length) && (
        <div className="mx-auto mt-4 max-w-md space-y-1.5 rounded-xl border border-sand-200/70 bg-sand-100/60 px-4 py-3 text-[12px] leading-snug text-ink-soft">
          {dest.altitudeNote && <p>Altitude: {dest.altitudeNote}</p>}
          {dest.practical?.map((p, i) => <p key={i}>{p}</p>)}
          {dest.halalNote && <p>Halal: {dest.halalNote}</p>}
        </div>
      )}

      {/* category filter */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {(["all", ...cats] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c as SuggCategory | "all")}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
              filter === c
                ? "border-clay-600 bg-clay-600 text-white"
                : "border-sand-200 bg-card text-ink-soft active:bg-sand-100"
            }`}
          >
            {c === "all" ? "All" : categoryLabel[c as SuggCategory]}
          </button>
        ))}
      </div>

      {planned.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            On your plan
          </h3>
          <div className="space-y-2.5">
            {planned.map((s) => (
              <SuggestionCard key={s.name} dest={dest} s={s} />
            ))}
          </div>
        </div>
      )}

      {extras.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            If you have time
          </h3>
          <div className="space-y-2.5">
            {extras.map((s) => (
              <SuggestionCard key={s.name} dest={dest} s={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
