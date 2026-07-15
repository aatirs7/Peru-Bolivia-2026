"use client";

import { trip } from "@/data/trip";

export default function NamePicker({
  onPick,
}: {
  onPick: (name: string) => void;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-ink-soft">Who's this?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {trip.travelers.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="min-h-[44px] rounded-full border border-clay-200 bg-white px-4 py-2 text-[14px] font-semibold text-clay-700 shadow-sm transition-colors active:bg-clay-500 active:text-white"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
