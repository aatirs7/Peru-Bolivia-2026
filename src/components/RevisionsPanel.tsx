"use client";

import { useState } from "react";
import { useRevisions } from "@/lib/useRevisions";

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 2) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Trip-lead revision reports: type what should change, it saves instantly on
 * this device (offline-safe) and syncs to the server when there's wifi so
 * the developer can pick it up later.
 */
export default function RevisionsPanel() {
  const { revisions, syncing, pendingCount, add, setStatus, remove } = useRevisions();
  const [text, setText] = useState("");
  const [where, setWhere] = useState("");
  const [important, setImportant] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    add(text, where, important ? "important" : "normal");
    setText("");
    setWhere("");
    setImportant(false);
  };

  const open = revisions.filter((r) => r.status === "open");
  const done = revisions.filter((r) => r.status === "done");

  return (
    <section aria-label="Revisions" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">Revisions</h2>
      <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-snug text-ink-faint">
        Spot something wrong or missing? Type it here · it saves on this phone
        instantly and syncs over wifi for Aatir to implement.
      </p>

      {/* the quick report form */}
      <div className="mx-auto mt-4 max-w-md rounded-xl border border-sand-200/70 bg-card p-4 text-left shadow-card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="What should change? e.g. Dinner Jul 27 moved to 8 PM, add Pisac market to Day 7..."
          className="w-full resize-none rounded-lg border border-sand-200 bg-bone px-3 py-2.5 text-[14px] leading-snug text-ink placeholder:text-ink-faint focus:border-clay-400 focus:outline-none"
        />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="Where? (optional) · e.g. Day 8, Bookings, homepage"
          className="mt-2 w-full rounded-lg border border-sand-200 bg-bone px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-clay-400 focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setImportant(!important)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${
              important
                ? "border-alert-600/50 bg-alert-100 text-alert-600 dark:bg-alert-600/20 dark:text-alert-300"
                : "border-sand-200 bg-card text-ink-faint"
            }`}
          >
            {important ? "Important" : "Mark important"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-lg bg-clay-600 px-5 py-2 text-[13.5px] font-semibold text-white shadow-lift active:bg-clay-700 disabled:opacity-40"
          >
            Add revision
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10.5px] text-ink-faint">
        {syncing
          ? "Syncing..."
          : pendingCount > 0
            ? `${pendingCount} waiting for wifi to sync`
            : revisions.length > 0
              ? "All synced"
              : ""}
      </p>

      {open.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Open · {open.length}
          </h3>
          <div className="space-y-2.5">
            {open.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl border bg-card p-4 text-center shadow-card ${
                  r.priority === "important" ? "border-alert-600/30" : "border-sand-200/70"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {r.priority === "important" && (
                    <span className="rounded-md bg-alert-100 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-alert-600 dark:bg-alert-600/20 dark:text-alert-300">
                      Important
                    </span>
                  )}
                  {r.where && (
                    <span className="rounded-md bg-sand-200 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                      {r.where}
                    </span>
                  )}
                  <span className="text-[10px] text-ink-faint">
                    {relative(r.createdAt)}
                    {r.dirty ? " · pending" : ""}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-snug text-ink">{r.text}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "done")}
                    className="rounded-lg bg-andes-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white active:bg-andes-800"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-ink-faint active:bg-sand-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Implemented · {done.length}
          </h3>
          <div className="space-y-2.5">
            {done.map((r) => (
              <div key={r.id} className="rounded-xl border border-sand-200/70 bg-card p-4 text-center opacity-60 shadow-card">
                <p className="whitespace-pre-wrap text-[13.5px] leading-snug text-ink line-through">{r.text}</p>
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "open")}
                    className="rounded-lg border border-sand-200 bg-card px-3 py-1 text-[12px] font-medium text-ink-faint active:bg-sand-100"
                  >
                    Reopen
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-lg border border-sand-200 bg-card px-3 py-1 text-[12px] font-medium text-ink-faint active:bg-sand-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {revisions.length === 0 && (
        <p className="mt-8 text-[13px] text-ink-faint">No revisions yet.</p>
      )}
    </section>
  );
}
