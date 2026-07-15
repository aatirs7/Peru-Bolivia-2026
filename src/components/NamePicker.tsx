"use client";

import { trip } from "@/data/trip";

export default function NamePicker({
  onPick,
}: {
  onPick: (name: string) => void;
}) {
  return (
    <div>
      <p className="text-center text-[12.5px] font-medium text-ink-soft">Who's this?</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {trip.travelers.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="min-h-[40px] rounded-lg border border-sand-200 bg-white px-4 py-1.5 text-[13.5px] font-medium text-ink-soft shadow-card transition-colors active:border-clay-500 active:text-clay-600"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
