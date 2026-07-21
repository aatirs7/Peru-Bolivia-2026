"use client";

import { useState } from "react";
import { ArrowDownUp, Link2, Pencil, Plus, Sunrise, Sunset, TriangleAlert } from "lucide-react";
import type { BookingCard, CardKind, Day, ScheduleItem, Status } from "@/types";
import type { DayOverride } from "@/lib/useDayEdits";
import type { View } from "@/lib/useView";
import { sunTimes } from "@/lib/sun";
import { formatMin, parseTimeField, sortByTime } from "@/lib/timeblocks";
import AlertNote from "./AlertNote";
import BookingCardView from "./BookingCard";
import RichText from "./RichText";

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
  "rounded-lg border border-sand-200 bg-bone px-2.5 py-2 text-[14px] text-ink focus:border-clay-400 focus:outline-none";
const labelCls = "mb-1 block text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint";
const labelCenter = "mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/** Clock time options every 15 min, plus any off-grid values already in use. */
function clockOptions(extra: (number | null)[]): string[] {
  const set = new Set<number>();
  for (let m = 0; m < 1440; m += 15) set.add(m);
  extra.forEach((m) => { if (m != null) set.add(m); });
  return Array.from(set).sort((a, b) => a - b).map((m) => formatMin(m));
}

function EditRowButtons({ onUndo, onSave, onDelete }: { onUndo: () => void; onSave: () => void; onDelete?: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button type="button" onClick={onUndo} className="flex-1 rounded-lg border border-sand-200 bg-card py-2 text-[13px] font-semibold text-ink-soft active:bg-sand-100">Undo</button>
      {onDelete && (
        <button type="button" onClick={onDelete} className="rounded-lg border border-alert-600/40 bg-card px-3.5 py-2 text-[13px] font-semibold text-alert-600 active:bg-sand-100">Delete</button>
      )}
      <button type="button" onClick={onSave} className="flex-1 rounded-lg bg-clay-600 py-2 text-[13px] font-semibold text-white shadow-lift active:bg-clay-700">Save</button>
    </div>
  );
}

/**
 * Time picker · pure dropdowns, no typing. One select lists every clock time
 * (15-min steps) plus plain-language labels (Morning, Layover…); a second
 * optional "to" select adds an end time for a range. Centered.
 */
function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [p0] = useState(() => parseTimeField(value));
  const nonPresetLabel = p0.label !== null && !LABEL_PRESETS.includes(p0.label) ? p0.label : null;
  const [opts] = useState(() => clockOptions([p0.startMin, p0.endMin]));
  const [start, setStart] = useState(
    p0.label !== null ? p0.label : p0.startMin !== null ? formatMin(p0.startMin) : "9:00 AM",
  );
  const [end, setEnd] = useState(p0.endMin !== null ? formatMin(p0.endMin) : "");

  const startIsClock = !LABEL_PRESETS.includes(start) && start !== nonPresetLabel && parseTimeField(start).startMin !== null;

  const changeStart = (s: string) => {
    setStart(s);
    if (opts.includes(s)) onChange(end ? `${s} – ${end}` : s);
    else { setEnd(""); onChange(s); } // a label
  };
  const changeEnd = (e: string) => { setEnd(e); onChange(e ? `${start} – ${e}` : start); };

  return (
    <div className="flex flex-col items-center gap-2">
      <select value={start} onChange={(e) => changeStart(e.target.value)} className={`${selCls} w-full max-w-[240px] text-center`} aria-label="Time">
        {nonPresetLabel && (
          <optgroup label="Current">
            <option value={nonPresetLabel}>{nonPresetLabel}</option>
          </optgroup>
        )}
        <optgroup label="Clock time">
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </optgroup>
        <optgroup label="Or a label">
          {LABEL_PRESETS.map((l) => <option key={l} value={l}>{l}</option>)}
        </optgroup>
      </select>
      {startIsClock && (
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-faint">
          <span>to</span>
          <select value={end} onChange={(e) => changeEnd(e.target.value)} className={`${selCls} text-center`} aria-label="End time">
            <option value="">no end time</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

/**
 * Layman-friendly link builder · type what the link should say, paste the url
 * (a Google Maps share link, a booking page…), tap Insert. It appends the
 * `[text](url)` form that RichText renders as a tap-through link.
 */
function LinkInserter({ onInsert }: { onInsert: (snippet: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const insert = () => {
    const u = url.trim();
    if (!u) return;
    const full = /^(https?:|mailto:|tel:)/i.test(u) ? u : `https://${u.replace(/^\/+/, "")}`;
    onInsert(`[${label.trim() || "Open link"}](${full})`);
    setLabel("");
    setUrl("");
    setOpen(false);
  };

  if (!open)
    return (
      <div className="mt-2 flex justify-center">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-sand-200 bg-card px-3 py-1.5 text-[12px] font-semibold text-ink-soft active:bg-sand-100">
          <Link2 size={13} strokeWidth={1.75} aria-hidden /> Add a link
        </button>
      </div>
    );

  return (
    <div className="mt-2 rounded-lg border border-sand-200 bg-bone/60 p-3">
      <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${inputCls} text-center`} placeholder="Link text · e.g. Meeting point" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" className={`${inputCls} mt-2 text-center`} placeholder="Paste the link · https://…" />
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={() => { setOpen(false); setLabel(""); setUrl(""); }} className="flex-1 rounded-lg border border-sand-200 bg-card py-1.5 text-[12.5px] font-semibold text-ink-soft active:bg-sand-100">Cancel</button>
        <button type="button" onClick={insert} className="flex-1 rounded-lg bg-clay-600 py-1.5 text-[12.5px] font-semibold text-white active:bg-clay-700">Insert</button>
      </div>
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
  const [alert, setAlert] = useState(item.alert ?? "");
  return (
    <div className="px-4 py-4 text-center">
      <p className={labelCenter}>Time</p>
      <TimePicker value={time} onChange={setTime} />
      <p className={`${labelCenter} mt-4`}>What's happening</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className={`${inputCls} resize-none text-center`} placeholder="Describe this block" />
      <LinkInserter onInsert={(s) => setText((t) => (t.trim() ? `${t.trim()} ${s}` : s))} />
      <p className={`${labelCenter} mt-4 text-alert-600`}>Reminder (optional)</p>
      <input value={alert} onChange={(e) => setAlert(e.target.value)} className={`${inputCls} text-center`} placeholder="e.g. Bring original passports" />
      <p className="mt-1 text-[11px] leading-snug text-ink-faint">Shows as a red-orange badge under this block. Leave blank for none.</p>
      <EditRowButtons
        onUndo={onCancel}
        onSave={() => onSave({ time: time.trim(), text: text.trim(), alert: alert.trim() || undefined })}
        onDelete={isNew ? undefined : onDelete}
      />
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
      <LinkInserter onInsert={(s) => setC((x) => {
        const lines = [...x.lines];
        const i = lines.length - 1;
        if (i >= 0 && lines[i].trim()) lines[i] = `${lines[i].trim()} ${s}`;
        else if (i >= 0) lines[i] = s;
        else lines.push(s);
        return { ...x, lines };
      })} />
      <label className={`${labelCls} mt-3 text-alert-600`}>Reminder (red-orange badge)</label>
      <input value={c.alert ?? ""} onChange={(e) => patch({ alert: e.target.value })} className={inputCls} placeholder="e.g. Bring original passports · blank for none" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div><label className={labelCls}>Ref (lead)</label><input value={c.ref ?? ""} onChange={(e) => patch({ ref: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>PIN (lead)</label><input value={c.pin ?? ""} onChange={(e) => patch({ pin: e.target.value })} className={inputCls} /></div>
      </div>
      <label className={`${labelCls} mt-3`}>Booked via (lead)</label>
      <input value={c.bookedVia ?? ""} onChange={(e) => patch({ bookedVia: e.target.value })} className={inputCls} />
      <label className={`${labelCls} mt-3`}>Lead note</label>
      <input value={c.leadNote ?? ""} onChange={(e) => patch({ leadNote: e.target.value })} className={inputCls} />
      <EditRowButtons onUndo={onCancel} onSave={() => onSave({ ...c, alert: c.alert?.trim() || undefined })} onDelete={isNew ? undefined : onDelete} />
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
      <LinkInserter onInsert={(s) => setWarn((t) => (t.trim() ? `${t.trim()} ${s}` : s))} />
      <label className={`${labelCls} mt-3`}>Note (italic footnote)</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Leave blank for none" />
      <LinkInserter onInsert={(s) => setNote((t) => (t.trim() ? `${t.trim()} ${s}` : s))} />
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

  const persist = (patch: Partial<{ title: string; route: string; warn: string; note: string; cards: BookingCard[]; schedule: ScheduleItem[] }>) => {
    const m = { title: day.title, route: day.route, warn: day.warn ?? "", note: day.note ?? "", cards: day.cards, schedule: day.schedule, ...patch };
    onSave?.({
      title: m.title.trim(),
      route: m.route.trim(),
      warn: m.warn.trim(),
      note: m.note.trim(),
      cards: m.cards.filter((c) => c.title.trim() || c.lines.some((l) => l.trim())).map((c) => ({ ...c, lines: c.lines.filter((l) => l.trim()) })),
      schedule: m.schedule.filter((s) => s.time.trim() || s.text.trim() || s.alert?.trim()),
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
              <button type="button" onClick={onResetDay} className="font-medium text-alert-600 underline decoration-alert-300 underline-offset-2">Reset to original</button>
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
            <BookingEditor card={blankCard} isNew onCancel={() => setOpenCard(null)} onSave={(nc) => { persist({ cards: [...day.cards, nc] }); setOpenCard(null); }} />
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
          <span><RichText text={day.warn} /></span>
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
                    <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">
                      <RichText text={item.text} />
                    </p>
                    {item.alert && <AlertNote text={item.alert} className="mt-2" />}
                  </div>
                  {editable && <PencilBtn onClick={() => { closeAll(); setOpenBlock(i); }} label={`Edit time block ${i + 1}`} />}
                </div>
              ),
            )}
            {editable && openBlock === "new" && (
              <div className={day.schedule.length > 0 ? "border-t border-sand-100" : ""}>
                <BlockEditor item={blankItem} isNew onCancel={() => setOpenBlock(null)} onSave={(ni) => { persist({ schedule: [...day.schedule, ni] }); setOpenBlock(null); }} />
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

      {day.note && (
        <p className="mt-5 text-center text-[12.5px] italic leading-relaxed text-ink-faint">
          <RichText text={day.note} />
        </p>
      )}
    </section>
  );
}
