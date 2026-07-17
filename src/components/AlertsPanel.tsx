"use client";

import { CalendarPlus } from "lucide-react";
import type { AlertRule } from "@/data/alerts";
import { downloadIcs } from "@/lib/ics";
import { usePush } from "@/lib/usePush";
import type { AlertGroups } from "@/lib/useAlerts";
import type { View } from "@/lib/useView";

const categoryCls: Record<AlertRule["category"], string> = {
  flight: "bg-clay-100 text-clay-700 dark:text-clay-300",
  tour: "bg-andes-100 text-andes-800 dark:bg-andes-800/40 dark:text-andes-100",
  health: "bg-andes-100 text-andes-800 dark:bg-andes-800/40 dark:text-andes-100",
  logistics: "bg-sand-200 text-ink-soft",
  cash: "bg-gold-100 text-gold-600 dark:bg-gold-400/15 dark:text-gold-400",
  docs: "bg-alert-100 text-alert-600 dark:bg-alert-600/20 dark:text-alert-300",
  booking: "bg-clay-100 text-clay-700 dark:text-clay-300",
};

function prettyFireAt(iso: string): string {
  const [date, time] = iso.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AlertCard({
  alert,
  done,
  onToggle,
  onOpenDay,
}: {
  alert: AlertRule;
  done: boolean;
  onToggle: () => void;
  onOpenDay: (i: number) => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 text-center shadow-card ${
        alert.priority === "high" && !done
          ? "border-clay-300/60"
          : "border-sand-200/70"
      } ${done ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`rounded-md px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] ${categoryCls[alert.category]}`}
        >
          {alert.category}
        </span>
        {alert.priority === "high" && !done && (
          <span className="rounded-md border border-clay-300/60 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-clay-600 dark:text-clay-300">
            High
          </span>
        )}
      </div>
      <p className={`mt-2 text-[14.5px] font-semibold leading-snug text-ink ${done ? "line-through" : ""}`}>
        {alert.title}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-clay-500">
        {prettyFireAt(alert.fireAt)}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">{alert.body}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {alert.action && (
          <a
            href={alert.action.href}
            className="inline-block rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-clay-600 active:bg-sand-100"
          >
            {alert.action.label}
          </a>
        )}
        {alert.dayIdx != null && (
          <button
            type="button"
            onClick={() => onOpenDay(alert.dayIdx!)}
            className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft active:bg-sand-100"
          >
            View day
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold ${
            done
              ? "border border-sand-200 bg-card text-ink-faint active:bg-sand-100"
              : "bg-andes-600 text-white active:bg-andes-800"
          }`}
        >
          {done ? "Undo" : "Done"}
        </button>
      </div>
    </div>
  );
}

function Group({
  title,
  alerts,
  isDone,
  toggleDone,
  onOpenDay,
}: {
  title: string;
  alerts: AlertRule[];
  isDone: (id: string) => boolean;
  toggleDone: (id: string) => void;
  onOpenDay: (i: number) => void;
}) {
  if (alerts.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {title}
      </h3>
      <div className="space-y-2.5">
        {alerts.map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            done={isDone(a.id)}
            onToggle={() => toggleDone(a.id)}
            onOpenDay={onOpenDay}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The in-app alerts feed · recomputed from the itinerary and the device clock
 * on every open. The calendar button exports the same set as .ics so phones
 * fire native reminders even when the app is closed.
 */
export default function AlertsPanel({
  view,
  groups,
  isDone,
  toggleDone,
  onOpenDay,
}: {
  view: View;
  groups: AlertGroups;
  isDone: (id: string) => boolean;
  toggleDone: (id: string) => void;
  onOpenDay: (i: number) => void;
}) {
  const { state: push, enable, disable, sendTest } = usePush(view);
  const empty =
    groups.today.length + groups.next48.length + groups.upcoming.length + groups.done.length === 0;

  return (
    <section aria-label="Alerts and reminders" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">Alerts & reminders</h2>
      <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-snug text-ink-faint">
        Derived from the itinerary on this device · nothing to sync. Add them to
        your calendar once and your phone reminds you even with the app closed.
      </p>

      <button
        type="button"
        onClick={() => downloadIcs(view)}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-clay-600 px-5 text-[14px] font-semibold text-white shadow-lift active:bg-clay-700"
      >
        <CalendarPlus size={16} strokeWidth={2} aria-hidden />
        Add trip reminders to calendar
      </button>
      <p className="mt-1.5 text-[10.5px] text-ink-faint">
        Downloads an .ics file · open it and choose Add to Calendar for
        exact-time alarms, fully offline.
      </p>

      {/* push notifications · the one online-optional module */}
      <div className="mx-auto mt-4 max-w-md rounded-xl border border-sand-200/70 bg-card p-4 shadow-card">
        <p className="text-[13.5px] font-semibold text-ink">Push notifications</p>
        <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-snug text-ink-faint">
          A morning and an evening digest of the day's reminders, delivered
          even when the app is closed. Needs wifi to enable. On iPhone: add
          the app to your Home Screen first (iOS 16.4+), then enable here.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {push === "unsupported" && (
            <p className="text-[12px] text-ink-faint">Not supported in this browser.</p>
          )}
          {push === "denied" && (
            <p className="text-[12px] text-ink-faint">
              Notifications are blocked · allow them in your browser settings, then retry.
            </p>
          )}
          {(push === "off" || push === "busy") && (
            <button
              type="button"
              disabled={push === "busy"}
              onClick={() => void enable()}
              className="rounded-lg bg-andes-600 px-4 py-2 text-[13px] font-semibold text-white active:bg-andes-800 disabled:opacity-60"
            >
              {push === "busy" ? "Working..." : "Enable on this device"}
            </button>
          )}
          {push === "on" && (
            <>
              <span className="rounded-md border border-andes-400/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-andes-600 dark:text-andes-400">
                Enabled
              </span>
              <button
                type="button"
                onClick={() => void sendTest()}
                className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft active:bg-sand-100"
              >
                Send test
              </button>
              <button
                type="button"
                onClick={() => void disable()}
                className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-ink-faint active:bg-sand-100"
              >
                Disable
              </button>
            </>
          )}
        </div>
      </div>

      {empty && (
        <p className="mt-8 text-[13px] text-ink-faint">No alerts for this view.</p>
      )}

      <Group title="Today" alerts={groups.today} isDone={isDone} toggleDone={toggleDone} onOpenDay={onOpenDay} />
      <Group title="Next 48 hours" alerts={groups.next48} isDone={isDone} toggleDone={toggleDone} onOpenDay={onOpenDay} />
      <Group title="Upcoming" alerts={groups.upcoming} isDone={isDone} toggleDone={toggleDone} onOpenDay={onOpenDay} />
      <Group title="Done" alerts={groups.done} isDone={isDone} toggleDone={toggleDone} onOpenDay={onOpenDay} />
    </section>
  );
}
