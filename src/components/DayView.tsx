"use client";

import { useState } from "react";
import { ArrowDownUp, Pencil, Plus, Sunrise, Sunset, TriangleAlert } from "lucide-react";
import type { BookingCard, CardKind, Day, ScheduleItem, Status } from "@/types";
import type { DayOverride } from "@/lib/useDayEdits";
import type { View } from "@/lib/useView";
import { sunTimes } from "@/lib/sun";
import {
  composeClock,
  minuteParts,
  parseTimeField,
  partsToMinutes,
  sortByTime,
} from "@/lib/timeblocks";
import BookingCardView from "./BookingCard";

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
const LABEL_PRESETS = ["Morning", "Midday", "Afternoon", "Evening", "Night", "Early AM", "All day", "Layover", "Free time", "Flexible"];

const inputCls =
  "w-full rounded-lg border border-sand-200 bg-bone px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:border-clay-400 focus:outline-none";
const selCls =
  "rounded-lg border border-sand-200 bg-bone px-2 py-2 text-[14px] text-ink focus:border-clay-400 focus:outline-none";
const labelCls = "mb-1 block text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function EditRowButtons({ onUndo, onSave, onDelete }: { onUndo: () => void; onSave: () => void; onDelete?: () => void }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <button type="button" onClick={onUndo} className="flex-1 rounded-lg border border-sand-200 bg-card py-2 text-[13px] font-semibold text-ink-soft active:bg-sand-100">
        Undo
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} className="rounded-lg border border-alert-600/40 bg-card px-3.5 py-2 text-[13px] font-semibold text-alert-600 active:bg-sand-100">
          Delete
        </button>
      )}
      <button type="button" onClick={onSave} className="flex-1 rounded-lg bg-clay-600 py-2 text-[13px] font-semibold text-white shadow-lift active:bg-clay-700">
        Save
      </button>
    </div>
  );
}

/** Hour : minute : AM/PM dropdowns for a time in minutes-past-midnight. */
function ClockSelect({ minutes, onChange }: { minutes: number; onChange: (m: number) => void }) {
  const { h12, min, ap } = minuteParts(minutes);
  const minOpts = Array.from(new Set([...Array.from({ length: 12 }, (_, i) => i * 5), min])).sort((a, b) => a - b);
  const set = (h: number, mi: number, a: "AM" | "PM") => onChange(partsToMinutes(h, mi, a));
  return (
    <div className="flex items-center gap-1">
      <select value={h12} onChange={(e) => set(+e.target.value, min, ap)} className={selCls} aria-label="Hour">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-ink-faint">:</span>
      <select value={min} onChange={(e) => set(h12, +e.target.value, ap)} className={selCls} aria-label="Minute">
        {minOpts.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
      </select>
      <select value={ap} onChange={(e) => set(h12, min, e.target.value as "AM" | "PM")} className={selCls} aria-label="AM or PM">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

/** Structured time editor · clock dropdowns (with optional end) or a label. */
function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [p0] = useState(() => parseTimeField(value));
  const [mode, setMode] = useState<"clock" | "label">(p0.startMin === null && p0.label !== null ? "label" : "clock");
  const [startMin, setStartMin] = useState(p0.startMin ?? 540);
  const [hasEnd, setHasEnd] = useState(p0.endMin !== null);
  const [endMin, setEndMin] = useState(p0.endMin ?? Math.min((p0.startMin ?? 540) + 60, 1439));
  const [label, setLabel] = useState(p0.label ?? "");

  const emit = (n: Partial<{ mode: "clock" | "label"; startMin: number; hasEnd: boolean; endMin: number; label: string }>) => {
    const s = { mode, startMin, hasEnd, endMin, label, ...n };
    onChange(s.mode === "label" ? s.label : composeClock(s.startMin, s.hasEnd ? s.endMin : null));
  };

  return (
    <div>
      <div className="inline-flex rounded-lg border border-sand-200 bg-card p-0.5">
        {(["clock", "label"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); emit({ mode: m }); }}
            className={`rounded-md px-3 py-1 text-[12px] font-semibold ${mode === m ? "bg-clay-600 text-white" : "text-ink-faint"}`}
          >
            {m === "clock" ? "Clock time" : "Label"}
          </button>
        ))}
      </div>

      {mode === "clock" ? (
        <div className="mt-2">
          <label className={labelCls}>Start</label>
          <ClockSelect minutes={startMin} onChange={(v) => { setStartMin(v); emit({ startMin: v }); }} />
          <label className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
            <input type="checkbox" checked={hasEnd} onChange={(e) => { setHasEnd(e.target.checked); emit({ hasEnd: e.target.checked }); }} className="h-4 w-4 accent-clay-600" />
            Add an end time (a range)
          </label>
          {hasEnd && (
            <div className="mt-1.5">
              <label className={labelCls}>End</label>
              <ClockSelect minutes={endMin} onChange={(v) => { setEndMin(v); emit({ endMin: v }); }} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2">
          <input value={label} onChange={(e) => { setLabel(e.target.value); emit({ label: e.target.value }); }} className={inputCls} placeholder="e.g. Morning, Layover, ~10:30 AM" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LABEL_PRESETS.map((l) => (
              <button key={l} type="button" onClick={() => { setLabel(l); emit({ label: l }); }} className="rounded-md border border-sand-200 bg-card px-2 py-1 text-[11.5px] font-medium text-ink-soft active:bg-sand-100">
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({ item, isNew, onSave, onCancel, onDelete }: {
  item: ScheduleItem;
  isNew?: boolean;
  onSave: (it: ScheduleItem) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [time, setTime] = useState(item.time);
  const [text, setText] = useState(item.text);
  return (
    <div className="px-4 py-3.5 text-left">
      <label className={labelCls}>Time</label>
      <TimePicker value={time} onChange={setTime} />
      <label className={`${labelCls} mt-3`}>What's happening</label>
      <input value={text} onChange={(e) => setText(e.target.value)} className={inputCls} placeholder="Describe this block" />
      <EditRowButtons onUndo={onCancel} onSave={() => onSave({ time: time.trim(), text: text.trim() })} onDelete={isNew ? undefined : onDelete} />
    </div>
  );
}

function BookingEditor({ card, isNew, onSave, onCancel, onDelete }: {
  card: BookingCard;
  isNew?: boolean;
  onSave: (c: BookingCard) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [c, setC] = useState<BookingCard>({ ...card, lines: [...card.lines] });
  const patch = (p: Partial<BookingCard>) => setC((x) => ({ ...x, ...p }));
  return (
    <div className="rounded-xl border border-clay-300/60 bg-card p-4 text-left shadow-card">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Type</label>
          <select value={c.kind} onChange={(e) => patch({ kind: e.target.value as CardKind })} className={`${selCls} w-full`}>
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={c.status} onChange={(e) => patch({ status: e.target.value as Status })} className={`${selCls} w-full`}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <label className={`${labelCls} mt-3`}>Title</label>
      <input value={c.title} onChange={(e) => patch({ title: e.target.value })} className={inputCls} placeholder="e.g. JetSMART · direct" />
      <label className={`${labelCls} mt-3`}>Details (one per line)</label>
      <textarea value={c.lines.join("\n")} onChange={(e) => patch({ lines: e.target.value.split("\n") })} rows={2} className={`${inputCls} resize-none`} placeholder="Times, addresses, what's included..." />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div><label className={labelCls}>Ref (lead)</label><input value={c.ref ?? ""} onChange={(e) => patch({ ref: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>PIN (lead)</label><input value={c.pin ?? ""} onChange={(e) => patch({ pin: e.target.value })} className={inputCls} /></div>
      </div>
      <label className={`${labelCls} mt-3`}>Booked via (lead)</label>
      <input value={c.bookedVia ?? ""} onChange={(e) => patch({ bookedVia: e.target.value })} className={inputCls} />
      <label className={`${labelCls} mt-3`}>Lead note</label>
      <input value={c.leadNote ?? ""} onChange={(e) => patch({ leadNote: e.target.value })} className={inputCls} />
      <EditRowButtons onUndo={onCancel} onSave={() => onSave(c)} onDelete={isNew ? undefined : onDelete} />
    </div>
  );
}

function HeaderEditor({ day, onSave, onCancel }: { day: Day; onSave: (m: { title: string; route: string; warn: string; note: string }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(day.title);
  const [route, setRoute] = useState(day.route);
  const [warn, setWarn] = useState(day.warn ?? "");
  const [note, setNote] = useState(day.note ?? "");
  return (
    <div className="mt-3 rounded-xl border border-clay-300/60 bg-card p-4 text-left shadow-card">
      <label className={labelCls}>Day title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      <label className={`${labelCls} mt-3`}>Short label (day rail)</label>
      <input value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls} />
      <label className={`${labelCls} mt-3`}>Warning (amber banner)</label>
      <textarea value={warn} onChange={(e) => setWarn(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Leave blank for none" />
      <label className={`${labelCls} mt-3`}>Note (italic footnote)</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Leave blank for none" />
      <EditRowButtons onUndo={onCancel} onSave={() => onSave({ title, route, warn, note })} />
    </div>
  );
}

function PencilBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-200 bg-card text-ink-soft shadow-card active:bg-sand-100">
      <Pencil size={13} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

const blankCard: BookingCard = { kind: "tour", title: "", status: "confirmed", lines: [] };
const blankItem: ScheduleItem = { time: "", text: "" };

/**
 * The day plan · normal read-only display for family and for lead when nothing
 * is open. In Lead view each booking and each time block has a pencil; tapping
 * one turns just that item into an inline editor with its own Save / Undo (and
 * Delete). Saving persists the whole day overlay via a keyed remount.
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
  editable?: boolean;
  onSave?: (patch: Omit<DayOverride, "dayIdx" | "updatedAt" | "dirty">) => void;
  onResetDay?: () => void;
}) {
  const [openHeader, setOpenHeader] = useState(false);
  const [openCard, setOpenCard] = useState<number | "new" | null>(null);
  const [openBlock, setOpenBlock] = useState<number | "new" | null>(null);
  const sun = sunTimes(day.coords, day.date);

  // persist the whole day, overriding just the changed slice
  const persist = (patch: Partial<{ title: string; route: string; warn: string; note: string; cards: BookingCard[]; schedule: ScheduleItem[] }>) => {
    const m = {
      title: day.title,
      route: day.route,
      warn: day.warn ?? "",
      note: day.note ?? "",
      cards: day.cards,
      schedule: day.schedule,
      ...patch,
    };
    onSave?.({
      title: m.title.trim(),
      route: m.route.trim(),
      warn: m.warn.trim(),
      note: m.note.trim(),
      cards: m.cards.filter((c) => c.title.trim() || c.lines.some((l) => l.trim())).map((c) => ({ ...c, lines: c.lines.filter((l) => l.trim()) })),
      schedule: m.schedule.filter((s) => s.time.trim() || s.text.trim()),
    });
  };

  const closeAll = () => { setOpenHeader(false); setOpenCard(null); setOpenBlock(null); };

  return (
    <section aria-label={`Day ${day.index}`}>
      <header className="mb-5 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay-500">
          Day {String(day.index).padStart(2, "0")} · {day.weekday} · {prettyDate(day.date)}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <h2 className="text-[24px] font-semibold leading-tight tracking-tight text-ink">{day.title}</h2>
          {editable && !openHeader && <PencilBtn onClick={() => { closeAll(); setOpenHeader(true); }} label="Edit day heading" />}
        </div>

        <p className="mt-1.5 flex items-center justify-center gap-3 text-[12px] font-medium text-ink-faint">
          <span className="inline-flex items-center gap-1"><Sunrise size={13} strokeWidth={1.75} className="text-gold-600 dark:text-gold-400" aria-hidden />{sun.sunrise}</span>
          <span className="inline-flex items-center gap-1"><Sunset size={13} strokeWidth={1.75} className="text-clay-500" aria-hidden />{sun.sunset}</span>
        </p>

        {openHeader && editable && (
          <HeaderEditor day={day} onCancel={() => setOpenHeader(false)} onSave={(mta) => { persist(mta); setOpenHeader(false); }} />
        )}

        {exploreName && onExplore && (
          <div className="mt-2.5">
            <button type="button" onClick={onExplore} className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-clay-600 shadow-card active:bg-sand-100">
              Explore {exploreName} →
            </button>
          </div>
        )}

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
      {(day.cards.length > 0 || editable) && (
        <div className="space-y-3">
          {day.cards.map((card, i) =>
            editable && openCard === i ? (
              <BookingEditor
                key={i}
                card={card}
                onCancel={() => setOpenCard(null)}
                onDelete={() => { persist({ cards: day.cards.filter((_, k) => k !== i) }); setOpenCard(null); }}
                onSave={(nc) => { persist({ cards: day.cards.map((c, k) => (k === i ? nc : c)) }); setOpenCard(null); }}
              />
            ) : (
              <div key={i} className="relative">
                {editable && (
                  <div className="absolute right-2 top-2 z-[1]">
                    <PencilBtn onClick={() => { closeAll(); setOpenCard(i); }} label={`Edit booking ${i + 1}`} />
                  </div>
                )}
                <BookingCardView card={card} view={view} />
              </div>
            ),
          )}
          {editable && openCard === "new" && (
            <BookingEditor
              card={blankCard}
              isNew
              onCancel={() => setOpenCard(null)}
              onSave={(nc) => { persist({ cards: [...day.cards, nc] }); setOpenCard(null); }}
            />
          )}
          {editable && openCard !== "new" && (
            <div className="flex justify-center">
              <button type="button" onClick={() => { closeAll(); setOpenCard("new"); }} className="inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100">
                <Plus size={15} strokeWidth={2} aria-hidden /> Add booking
              </button>
            </div>
          )}
        </div>
      )}

      {day.warn && (
        <div className="mt-3 flex items-start justify-center gap-2 rounded-xl border border-gold-400/30 bg-gold-100/40 px-4 py-3 text-center text-[13px] leading-snug text-ink-soft dark:border-gold-400/20 dark:bg-gold-400/10">
          <TriangleAlert size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span>{day.warn}</span>
        </div>
      )}

      {/* the day · time blocks */}
      {(day.schedule.length > 0 || editable) && (
        <div className="mt-6">
          <h3 className="mb-2.5 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">The day</h3>
          <div className="overflow-hidden rounded-xl border border-sand-200/70 bg-card shadow-card">
            {day.schedule.map((item, i) =>
              editable && openBlock === i ? (
                <div key={i} className={i > 0 ? "border-t border-sand-100" : ""}>
                  <BlockEditor
                    item={item}
                    onCancel={() => setOpenBlock(null)}
                    onDelete={() => { persist({ schedule: day.schedule.filter((_, k) => k !== i) }); setOpenBlock(null); }}
                    onSave={(ni) => { persist({ schedule: day.schedule.map((s, k) => (k === i ? ni : s)) }); setOpenBlock(null); }}
                  />
                </div>
              ) : (
                <div key={i} className={`flex items-center gap-2 px-3 py-3.5 ${i > 0 ? "border-t border-sand-100" : ""}`}>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums text-clay-500">{item.time}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{item.text}</p>
                  </div>
                  {editable && <PencilBtn onClick={() => { closeAll(); setOpenBlock(i); }} label={`Edit time block ${i + 1}`} />}
                </div>
              ),
            )}
            {editable && openBlock === "new" && (
              <div className={day.schedule.length > 0 ? "border-t border-sand-100" : ""}>
                <BlockEditor
                  item={blankItem}
                  isNew
                  onCancel={() => setOpenBlock(null)}
                  onSave={(ni) => { persist({ schedule: [...day.schedule, ni] }); setOpenBlock(null); }}
                />
              </div>
            )}
          </div>
          {editable && openBlock !== "new" && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => { closeAll(); setOpenBlock("new"); }} className="inline-flex items-center gap-1.5 rounded-lg border border-clay-300/60 bg-card px-4 py-2 text-[13px] font-semibold text-clay-600 active:bg-sand-100">
                <Plus size={15} strokeWidth={2} aria-hidden /> Add time block
              </button>
              {day.schedule.length > 1 && (
                <button type="button" onClick={() => persist({ schedule: sortByTime(day.schedule) })} className="inline-flex items-center gap-1.5 rounded-lg border border-sand-200 bg-card px-4 py-2 text-[13px] font-semibold text-ink-soft active:bg-sand-100">
                  <ArrowDownUp size={14} strokeWidth={1.75} aria-hidden /> Sort by time
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {day.note && <p className="mt-5 text-center text-[12.5px] italic leading-relaxed text-ink-faint">{day.note}</p>}
    </section>
  );
}
