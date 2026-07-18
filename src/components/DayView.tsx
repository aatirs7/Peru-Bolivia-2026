"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Sunrise, Sunset, TriangleAlert, X } from "lucide-react";
import type { BookingCard, CardKind, Day, ScheduleItem, Status } from "@/types";
import type { DayOverride } from "@/lib/useDayEdits";
import type { View } from "@/lib/useView";
import { sunTimes } from "@/lib/sun";
import BookingCardView from "./BookingCard";
import StatusPill from "./StatusPill";

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

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

interface Draft {
  title: string;
  route: string;
  warn: string;
  note: string;
  cards: BookingCard[];
  schedule: ScheduleItem[];
}

function seed(day: Day): Draft {
  return {
    title: day.title,
    route: day.route,
    warn: day.warn ?? "",
    note: day.note ?? "",
    cards: day.cards.map((c) => ({ ...c, lines: [...c.lines] })),
    schedule: day.schedule.map((s) => ({ ...s })),
  };
}

/** Small round pencil button shown on each editable item (lead only). */
function EditToggle({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-card ${
        open ? "border-clay-600 bg-clay-600 text-white" : "border-sand-200 bg-card text-ink-soft active:bg-sand-100"
      }`}
    >
      {open ? <Check size={14} strokeWidth={2} aria-hidden /> : <Pencil size={13} strokeWidth={1.75} aria-hidden />}
    </button>
  );
}

/**
 * The day plan · read-only for family, in-place editable for the trip lead.
 * Each booking and each time block carries its own pencil that expands only
 * that item; a sticky bar saves or undoes everything at once, so nothing is
 * ever saved by an accidental tap. `key` is bumped by the parent after a save
 * so the draft reseeds from the fresh effective day.
 */
export default function DayView({
  day,
  view,
  exploreName,
  onExplore,
  edited,
  editable,
  onSave,
  onResetDay,
}: {
  day: Day;
  view: View;
  exploreName?: string;
  onExplore?: () => void;
  edited?: boolean;
  /** Lead view · turns on the pencils and the save bar. */
  editable?: boolean;
  onSave?: (patch: Omit<DayOverride, "dayIdx" | "updatedAt" | "dirty">) => void;
  onResetDay?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => seed(day));
  const [baseline] = useState<string>(() => JSON.stringify(seed(day)));
  const [openHeader, setOpenHeader] = useState(false);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [openBlock, setOpenBlock] = useState<number | null>(null);

  const sun = sunTimes(day.coords, day.date);
  const dirty = editable && JSON.stringify(draft) !== baseline;

  // card mutators
  const patchCard = (i: number, patch: Partial<BookingCard>) =>
    setDraft((d) => ({ ...d, cards: d.cards.map((c, k) => (k === i ? { ...c, ...patch } : c)) }));
  const deleteCard = (i: number) =>
    setDraft((d) => ({ ...d, cards: d.cards.filter((_, k) => k !== i) }));
  const moveCard = (i: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, cards: move(d.cards, i, dir) }));
  const addCard = () => {
    setDraft((d) => ({ ...d, cards: [...d.cards, { kind: "tour", title: "", status: "confirmed", lines: [] }] }));
    setOpenCard(draft.cards.length);
  };

  // schedule mutators
  const patchItem = (i: number, patch: Partial<ScheduleItem>) =>
    setDraft((d) => ({ ...d, schedule: d.schedule.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  const deleteItem = (i: number) =>
    setDraft((d) => ({ ...d, schedule: d.schedule.filter((_, k) => k !== i) }));
  const moveItem = (i: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, schedule: move(d.schedule, i, dir) }));
  const addItem = () => {
    setDraft((d) => ({ ...d, schedule: [...d.schedule, { time: "", text: "" }] }));
    setOpenBlock(draft.schedule.length);
  };

  const save = () => {
    onSave?.({
      title: draft.title.trim(),
      route: draft.route.trim(),
      warn: draft.warn.trim(),
      note: draft.note.trim(),
      cards: draft.cards
        .filter((c) => c.title.trim() || c.lines.some((l) => l.trim()))
        .map((c) => ({ ...c, lines: c.lines.filter((l) => l.trim()) })),
      schedule: draft.schedule.filter((s) => s.time.trim() || s.text.trim()),
    });
    setOpenHeader(false);
    setOpenCard(null);
    setOpenBlock(null);
  };

  const undo = () => {
    setDraft(JSON.parse(baseline));
    setOpenHeader(false);
    setOpenCard(null);
    setOpenBlock(null);
  };

  return (
    <section aria-label={`Day ${day.index}`} className={editable ? "pb-24" : undefined}>
      <header className="mb-5 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
          Day {String(day.index).padStart(2, "0")} · {day.weekday} · {prettyDate(day.date)}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <h2 className="text-[24px] font-semibold leading-tight tracking-tight text-ink">{draft.title}</h2>
          {editable && <EditToggle open={openHeader} onClick={() => setOpenHeader((o) => !o)} label="Edit day heading" />}
        </div>

        <p className="mt-1.5 flex items-center justify-center gap-3 text-[12px] font-medium text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Sunrise size={13} strokeWidth={1.75} className="text-gold-600 dark:text-gold-400" aria-hidden />
            {sun.sunrise}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sunset size={13} strokeWidth={1.75} className="text-clay-500" aria-hidden />
            {sun.sunset}
          </span>
        </p>

        {openHeader && editable && (
          <div className="mt-3 rounded-xl border border-sand-200/70 bg-card p-4 text-left shadow-card">
            <label className={labelCls}>Day title</label>
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className={inputCls} />
            <label className={`${labelCls} mt-3`}>Short label (day rail)</label>
            <input value={draft.route} onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))} className={inputCls} />
            <label className={`${labelCls} mt-3`}>Warning (amber banner)</label>
            <textarea value={draft.warn} onChange={(e) => setDraft((d) => ({ ...d, warn: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Leave blank for none" />
            <label className={`${labelCls} mt-3`}>Note (italic footnote)</label>
            <textarea value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Leave blank for none" />
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          {exploreName && onExplore && (
            <button type="button" onClick={onExplore} className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-clay-600 shadow-card active:bg-sand-100">
              Explore {exploreName} →
            </button>
          )}
        </div>

        {edited && editable && (
          <p className="mt-2 text-[11px] text-ink-faint">
            You've edited this day.{" "}
            {onResetDay && (
              <button type="button" onClick={onResetDay} className="font-medium text-alert-600 underline decoration-alert-300 underline-offset-2">
                Reset to original
              </button>
            )}
          </p>
        )}
      </header>

      {/* bookings */}
      {(draft.cards.length > 0 || editable) && (
        <div className="space-y-3">
          {draft.cards.map((card, i) =>
            editable && openCard === i ? (
              <div key={i} className="rounded-xl border border-clay-300/60 bg-card p-4 text-left shadow-card">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-ink-faint">Editing booking {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Move up" onClick={() => moveCard(i, -1)} disabled={i === 0} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100"><ChevronUp size={16} strokeWidth={1.75} aria-hidden /></button>
                    <button type="button" aria-label="Move down" onClick={() => moveCard(i, 1)} disabled={i === draft.cards.length - 1} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100"><ChevronDown size={16} strokeWidth={1.75} aria-hidden /></button>
                    <button type="button" aria-label="Delete booking" onClick={() => { deleteCard(i); setOpenCard(null); }} className="rounded-md p-1 text-alert-600 active:bg-sand-100"><X size={16} strokeWidth={2} aria-hidden /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={card.kind} onChange={(e) => patchCard(i, { kind: e.target.value as CardKind })} className={inputCls}>
                      {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={card.status} onChange={(e) => patchCard(i, { status: e.target.value as Status })} className={inputCls}>
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <label className={`${labelCls} mt-3`}>Title</label>
                <input value={card.title} onChange={(e) => patchCard(i, { title: e.target.value })} className={inputCls} placeholder="e.g. JetSMART · direct" />
                <label className={`${labelCls} mt-3`}>Details (one per line)</label>
                <textarea value={card.lines.join("\n")} onChange={(e) => patchCard(i, { lines: e.target.value.split("\n") })} rows={2} className={`${inputCls} resize-none`} placeholder="Times, addresses, what's included..." />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Ref (lead)</label><input value={card.ref ?? ""} onChange={(e) => patchCard(i, { ref: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>PIN (lead)</label><input value={card.pin ?? ""} onChange={(e) => patchCard(i, { pin: e.target.value })} className={inputCls} /></div>
                </div>
                <label className={`${labelCls} mt-3`}>Booked via (lead)</label>
                <input value={card.bookedVia ?? ""} onChange={(e) => patchCard(i, { bookedVia: e.target.value })} className={inputCls} />
                <label className={`${labelCls} mt-3`}>Lead note</label>
                <input value={card.leadNote ?? ""} onChange={(e) => patchCard(i, { leadNote: e.target.value })} className={inputCls} />
                <button type="button" onClick={() => setOpenCard(null)} className="mt-3 w-full rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-sand-50 active:opacity-90">Done</button>
              </div>
            ) : (
              <div key={i} className="relative">
                {editable && (
                  <div className="absolute right-2 top-2 z-[1]">
                    <EditToggle open={false} onClick={() => setOpenCard(i)} label={`Edit booking ${i + 1}`} />
                  </div>
                )}
                <BookingCardView card={card} view={view} />
              </div>
            ),
          )}
          {editable && (
            <button type="button" onClick={addCard} className="inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100">
              <Plus size={15} strokeWidth={2} aria-hidden /> Add booking
            </button>
          )}
        </div>
      )}

      {draft.warn && (
        <div className="mt-3 flex items-start justify-center gap-2 rounded-xl border border-gold-400/30 bg-gold-100/40 px-4 py-3 text-center text-[13px] leading-snug text-ink-soft dark:border-gold-400/20 dark:bg-gold-400/10">
          <TriangleAlert size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span>{draft.warn}</span>
        </div>
      )}

      {/* the day · time blocks */}
      {(draft.schedule.length > 0 || editable) && (
        <div className="mt-6">
          <h3 className="mb-2.5 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            The day
          </h3>
          <div className="overflow-hidden rounded-xl border border-sand-200/70 bg-card shadow-card">
            {draft.schedule.map((item, i) =>
              editable && openBlock === i ? (
                <div key={i} className={`px-4 py-3 text-left ${i > 0 ? "border-t border-sand-100" : ""}`}>
                  <label className={labelCls}>Time</label>
                  <input value={item.time} onChange={(e) => patchItem(i, { time: e.target.value })} className={inputCls} placeholder="9:00 AM" />
                  <label className={`${labelCls} mt-2`}>What's happening</label>
                  <input value={item.text} onChange={(e) => patchItem(i, { text: e.target.value })} className={inputCls} placeholder="Describe this block" />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="Move up" onClick={() => moveItem(i, -1)} disabled={i === 0} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100"><ChevronUp size={16} strokeWidth={1.75} aria-hidden /></button>
                      <button type="button" aria-label="Move down" onClick={() => moveItem(i, 1)} disabled={i === draft.schedule.length - 1} className="rounded-md p-1 text-ink-soft disabled:opacity-30 active:bg-sand-100"><ChevronDown size={16} strokeWidth={1.75} aria-hidden /></button>
                      <button type="button" aria-label="Delete time block" onClick={() => { deleteItem(i); setOpenBlock(null); }} className="rounded-md p-1 text-alert-600 active:bg-sand-100"><X size={16} strokeWidth={2} aria-hidden /></button>
                    </div>
                    <button type="button" onClick={() => setOpenBlock(null)} className="rounded-lg bg-ink px-4 py-1.5 text-[12.5px] font-semibold text-sand-50 active:opacity-90">Done</button>
                  </div>
                </div>
              ) : (
                <div key={i} className={`flex items-center gap-2 px-3 py-3.5 ${i > 0 ? "border-t border-sand-100" : ""}`}>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums text-clay-500">{item.time}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{item.text}</p>
                  </div>
                  {editable && (
                    <EditToggle open={false} onClick={() => setOpenBlock(i)} label={`Edit time block ${i + 1}`} />
                  )}
                </div>
              ),
            )}
          </div>
          {editable && (
            <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100">
              <Plus size={15} strokeWidth={2} aria-hidden /> Add time block
            </button>
          )}
        </div>
      )}

      {draft.note && (
        <p className="mt-5 text-center text-[12.5px] italic leading-relaxed text-ink-faint">{draft.note}</p>
      )}

      {/* sticky save bar · only when there are unsaved changes */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200/70 bg-bone/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2.5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-2.5">
            <button type="button" onClick={undo} className="flex-1 rounded-xl border border-sand-200 bg-card py-2.5 text-[13.5px] font-semibold text-ink-soft active:bg-sand-100">
              Undo changes
            </button>
            <button type="button" onClick={save} className="flex-1 rounded-xl bg-clay-600 py-2.5 text-[13.5px] font-semibold text-white shadow-lift active:bg-clay-700">
              Save edits
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
