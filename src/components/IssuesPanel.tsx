"use client";

import { useCallback, useEffect, useState } from "react";
import { deriveIssues, type Severity } from "@/data/issues";

const RESOLVED_KEY = "trip.issues.resolved";

const severityCls: Record<Severity, string> = {
  critical: "bg-alert-600 text-white",
  warning: "bg-gold-100 text-gold-600 dark:bg-gold-400/15 dark:text-gold-400",
  info: "bg-sand-200 text-ink-soft",
};

function prettyDeadline(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Trip-Lead only: every open gap, risk and action item in one place.
 * Auto-derived from trip data plus curated context, so it can't drift.
 * Resolve state is per lead device (localStorage).
 */
export default function IssuesPanel({ onOpenDay }: { onOpenDay: (i: number) => void }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESOLVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setResolved(new Set(parsed.filter((x) => typeof x === "string")));
      }
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setResolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(RESOLVED_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const issues = deriveIssues();
  const open = issues.filter((i) => !resolved.has(i.id));
  const closed = issues.filter((i) => resolved.has(i.id));
  const count = (s: Severity) => open.filter((i) => i.severity === s).length;
  const summary = [
    count("critical") ? `${count("critical")} critical` : null,
    count("warning") ? `${count("warning")} warning${count("warning") === 1 ? "" : "s"}` : null,
    count("info") ? `${count("info")} info` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const renderIssue = (issue: (typeof issues)[number], isResolved: boolean) => (
    <div
      key={issue.id}
      className={`rounded-xl border bg-card p-4 text-center shadow-card ${
        issue.severity === "critical" && !isResolved ? "border-alert-600/30" : "border-sand-200/70"
      } ${isResolved ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`rounded-md px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] ${severityCls[issue.severity]}`}
        >
          {issue.severity}
        </span>
        {issue.deadline && (
          <span className="rounded-md border border-sand-200 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            by {prettyDeadline(issue.deadline)}
          </span>
        )}
      </div>
      <p className={`mt-2 text-[14.5px] font-semibold leading-snug text-ink ${isResolved ? "line-through" : ""}`}>
        {issue.what}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">{issue.why}</p>
      <p className="mt-1.5 text-[12.5px] italic leading-snug text-ink-faint">{issue.action}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {issue.href && (
          <a
            href={issue.href.url}
            className="inline-block rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-clay-600 active:bg-sand-100"
          >
            {issue.href.label}
          </a>
        )}
        {issue.dayIdx != null && (
          <button
            type="button"
            onClick={() => onOpenDay(issue.dayIdx!)}
            className="rounded-lg border border-sand-200 bg-card px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft active:bg-sand-100"
          >
            View day
          </button>
        )}
        <button
          type="button"
          onClick={() => toggle(issue.id)}
          className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold ${
            isResolved
              ? "border border-sand-200 bg-card text-ink-faint active:bg-sand-100"
              : "bg-andes-600 text-white active:bg-andes-800"
          }`}
        >
          {isResolved ? "Reopen" : "Resolve"}
        </button>
      </div>
    </div>
  );

  return (
    <section aria-label="Issues and gaps" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">Issues & gaps</h2>
      <p className="mt-1 text-[12.5px] font-medium text-ink-faint">
        {summary || "Everything resolved. Nice."}
      </p>

      <div className="mt-4 space-y-2.5">{open.map((i) => renderIssue(i, false))}</div>

      {closed.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Resolved
          </h3>
          <div className="space-y-2.5">{closed.map((i) => renderIssue(i, true))}</div>
        </div>
      )}
    </section>
  );
}
