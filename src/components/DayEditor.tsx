"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import type { BookingCard, CardKind, Day, ScheduleItem, Status } from "@/types";
import type { DayOverride } from "@/lib/useDayEdits";

const KIND_OPTIONS: { value: CardKind; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "train", label: "Train" },
  { value: "stay", label: "Stay / hotel" },
  { value: "tour", label: "Tour / activity" },
  { value: "transport", label: "Transport" },
  { value: "gap", label: "Gap / missing" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "booked", label: "Booked" },
  { value: "to_confirm", label: "To confirm" },
  { value: "gap", label: "Gap" },
];

const inputCls =
  "w-full rounded-lg border border-sand-200 bg-bone px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:border-clay-400 focus:outline-none";
const labelCls = "mb-1 block text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint";

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * Full day editor for the trip lead: rename the day, add/edit/remove bookings
 * (every field), and add/reorder/edit hourly time blocks. Saves to the device
 * immediately and syncs over wifi. Plain inputs · easy for a layman.
 */
export default function DayEditor({
  day,
  dayIdx,
  hasOverride,
  onSave,
  onCancel,
  onReset,
}: {
  day: Day; // effective day (base merged with any existing override)
  dayIdx: number;
  hasOverride: boolean;
  onSave: (patch: Omit<DayOverride, "dayIdx" | "updatedAt" | "dirty">) => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const [title, setTitle] = useState(day.title);
  const [route, setRoute] = useState(day.route);
  const [warn, setWarn] = useState(day.warn ?? "");
  const [note, setNote] = useState(day.note ?? "");
  const [cards, setCards] = useState<BookingCard[]>(day.cards.map((c) => ({ ...c, lines: [...c.lines] })));
  const [schedule, setSchedule] = useState<ScheduleItem[]>(day.schedule.map((s) => ({ ...s })));

  const patchCard = (i: number, patch: Partial<BookingCard>) =>
    setCards((cs) => cs.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  const patchItem = (i: number, patch: Partial<ScheduleItem>) =>
    setSchedule((ss) => ss.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  const save = () => {
    onSave({
      title: title.trim(),
      route: route.trim(),
      warn: warn.trim(),
      note: note.trim(),
      cards: cards
        .filter((c) => c.title.trim() || c.lines.some((l) => l.trim()))
        .map((c) => ({ ...c, lines: c.lines.filter((l) => l.trim()) })),
      schedule: schedule.filter((s) => s.time.trim() || s.text.trim()),
    });
  };

  return (
    <section aria-label={`Edit day ${day.index}`} className="text-center">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-sand-200 bg-card px-3.5 py-2 text-[13px] font-medium text-ink-soft active:bg-sand-100"
        >
          Cancel
        </button>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
          Editing Day {day.index}
        </p>
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-clay-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lift active:bg-clay-700"
        >
          Save
        </button>
      </div>

      {/* day heading */}
      <div className="rounded-xl border border-sand-200/70 bg-card p-4 text-left shadow-card">
        <label className={labelCls}>Day title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Lima → Cusco" />
        <label className={`${labelCls} mt-3`}>Short label (day rail)</label>
        <input value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls} placeholder="e.g. Cusco" />
      </div>

      {/* bookings */}
      <h3 className="mb-2 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        Bookings
      </h3>
      <div className="space-y-3">
        {cards.map((c, i) => (
          <div key={i} className="rounded-xl border border-sand-200/70 bg-card p-4 text-left shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-faint">Booking {i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Move up" onClick={() => setCards((cs) => move(cs, i, -1))} disabled={i === 0} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100">
                  <ChevronUp size={16} strokeWidth={1.75} aria-hidden />
                </button>
                <button type="button" aria-label="Move down" onClick={() => setCards((cs) => move(cs, i, 1))} disabled={i === cards.length - 1} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100">
                  <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
                </button>
                <button type="button" aria-label="Delete booking" onClick={() => setCards((cs) => cs.filter((_, k) => k !== i))} className="rounded-md p-1 text-alert-600 active:bg-sand-100">
                  <X size={16} strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Type</label>
                <select value={c.kind} onChange={(e) => patchCard(i, { kind: e.target.value as CardKind })} className={inputCls}>
                  {KIND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={c.status} onChange={(e) => patchCard(i, { status: e.target.value as Status })} className={inputCls}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className={`${labelCls} mt-3`}>Title</label>
            <input value={c.title} onChange={(e) => patchCard(i, { title: e.target.value })} className={inputCls} placeholder="e.g. JetSMART · direct" />

            <label className={`${labelCls} mt-3`}>Details (one per line)</label>
            <textarea
              value={c.lines.join("\n")}
              onChange={(e) => patchCard(i, { lines: e.target.value.split("\n") })}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Times, addresses, what's included..."
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Ref (lead)</label>
                <input value={c.ref ?? ""} onChange={(e) => patchCard(i, { ref: e.target.value })} className={inputCls} placeholder="conf / PNR" />
              </div>
              <div>
                <label className={labelCls}>PIN (lead)</label>
                <input value={c.pin ?? ""} onChange={(e) => patchCard(i, { pin: e.target.value })} className={inputCls} placeholder="PIN" />
              </div>
            </div>
            <label className={`${labelCls} mt-3`}>Booked via (lead)</label>
            <input value={c.bookedVia ?? ""} onChange={(e) => patchCard(i, { bookedVia: e.target.value })} className={inputCls} placeholder="e.g. Booking.com" />
            <label className={`${labelCls} mt-3`}>Lead note</label>
            <input value={c.leadNote ?? ""} onChange={(e) => patchCard(i, { leadNote: e.target.value })} className={inputCls} placeholder="balances due, contacts..." />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setCards((cs) => [...cs, { kind: "tour", title: "", status: "confirmed", lines: [] }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100"
      >
        <Plus size={15} strokeWidth={2} aria-hidden /> Add booking
      </button>

      {/* schedule / time blocks */}
      <h3 className="mb-2 mt-6 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        The day · time blocks
      </h3>
      <div className="space-y-2">
        {schedule.map((s, i) => (
          <div key={i} className="rounded-xl border border-sand-200/70 bg-card p-3 shadow-card">
            <div className="flex items-start gap-2">
              <input
                value={s.time}
                onChange={(e) => patchItem(i, { time: e.target.value })}
                className={`${inputCls} w-[112px] shrink-0 text-center`}
                placeholder="9:00 AM"
              />
              <input
                value={s.text}
                onChange={(e) => patchItem(i, { text: e.target.value })}
                className={inputCls}
                placeholder="What's happening"
              />
            </div>
            <div className="mt-2 flex items-center justify-end gap-1">
              <button type="button" aria-label="Move up" onClick={() => setSchedule((ss) => move(ss, i, -1))} disabled={i === 0} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100">
                <ChevronUp size={16} strokeWidth={1.75} aria-hidden />
              </button>
              <button type="button" aria-label="Move down" onClick={() => setSchedule((ss) => move(ss, i, 1))} disabled={i === schedule.length - 1} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100">
                <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
              </button>
              <button type="button" aria-label="Delete time block" onClick={() => setSchedule((ss) => ss.filter((_, k) => k !== i))} className="rounded-md p-1 text-alert-600 active:bg-sand-100">
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setSchedule((ss) => [...ss, { time: "", text: "" }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100"
      >
        <Plus size={15} strokeWidth={2} aria-hidden /> Add time block
      </button>

      {/* warning + note */}
      <div className="mt-6 rounded-xl border border-sand-200/70 bg-card p-4 text-left shadow-card">
        <label className={labelCls}>Warning (amber banner)</label>
        <textarea value={warn} onChange={(e) => setWarn(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Heads-up for this day..." />
        <label className={`${labelCls} mt-3`}>Note (italic footnote)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Softer aside..." />
      </div>

      {/* actions */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="h-12 w-full rounded-xl bg-clay-600 text-[15px] font-semibold text-white shadow-lift active:bg-clay-700"
        >
          Save changes
        </button>
        {hasOverride && (
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-medium text-alert-600 underline decoration-alert-300 underline-offset-2"
          >
            Reset this day to the original
          </button>
        )}
      </div>
    </section>
  );
}
