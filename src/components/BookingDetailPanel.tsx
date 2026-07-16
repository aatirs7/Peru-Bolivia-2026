"use client";

import {
  BedDouble,
  Bus,
  Mountain,
  Plane,
  TrainFront,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { BookingDetail } from "@/data/bookings";
import type { CardKind } from "@/types";
import MapLink from "./MapLink";
import StatusPill from "./StatusPill";

const kindIcon: Record<CardKind, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  stay: BedDouble,
  tour: Mountain,
  transport: Bus,
  gap: TriangleAlert,
};

/**
 * One booking, one page: timings, refs, contacts and links in a single tap.
 * tel:/mailto:/maps links work offline; website links need wifi.
 */
export default function BookingDetailPanel({
  booking,
  onOpenDay,
}: {
  booking: BookingDetail;
  onOpenDay: (i: number) => void;
}) {
  const Icon = kindIcon[booking.kind];
  return (
    <section aria-label={booking.title} className="text-center">
      <Icon size={20} strokeWidth={1.75} className="mx-auto text-clay-500" aria-hidden />
      <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-tight text-ink">
        {booking.title}
      </h2>
      <p className="mt-1 text-[12.5px] font-medium text-ink-faint">{booking.dates}</p>
      <div className="mt-2 flex justify-center">
        <StatusPill status={booking.status} />
      </div>

      {booking.timings && booking.timings.length > 0 && (
        <div className="mt-4 rounded-xl border border-sand-200/70 bg-card shadow-card">
          <p className="border-b border-sand-100 px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Timings
          </p>
          <div className="px-4 py-3">
            {booking.timings.map((t, i) => (
              <p key={i} className={`text-[13px] leading-snug text-ink-soft ${i > 0 ? "mt-1.5" : ""}`}>
                {t}
              </p>
            ))}
          </div>
        </div>
      )}

      {(booking.ref || booking.pin || booking.bookedVia) && (
        <div className="mt-3 rounded-xl border border-sand-200/70 bg-card shadow-card">
          <p className="border-b border-sand-100 px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-clay-500">
            Booking reference
          </p>
          <dl className="space-y-1 px-4 py-3 text-[13px] leading-snug text-ink-soft">
            {booking.ref && (
              <div>
                <dt className="inline font-medium text-ink">Ref: </dt>
                <dd className="inline font-mono tracking-tight">{booking.ref}</dd>
              </div>
            )}
            {booking.pin && (
              <div>
                <dt className="inline font-medium text-ink">PIN: </dt>
                <dd className="inline font-mono tracking-tight">{booking.pin}</dd>
              </div>
            )}
            {booking.bookedVia && (
              <div>
                <dt className="inline font-medium text-ink">Booked via: </dt>
                <dd className="inline">{booking.bookedVia}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {booking.notes && booking.notes.length > 0 && (
        <div className="mt-3 rounded-xl border border-sand-200/70 bg-card shadow-card">
          <p className="border-b border-sand-100 px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Notes
          </p>
          <div className="px-4 py-3">
            {booking.notes.map((n, i) => (
              <p key={i} className={`text-[13px] leading-snug text-ink-soft ${i > 0 ? "mt-1.5" : ""}`}>
                {n}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {booking.links?.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target={l.url.startsWith("http") ? "_blank" : undefined}
            rel={l.url.startsWith("http") ? "noopener noreferrer" : undefined}
            className={`inline-flex min-h-[42px] items-center rounded-lg px-4 py-2 text-[13px] font-semibold ${
              l.url.startsWith("tel:")
                ? "bg-andes-600 text-white active:bg-andes-800"
                : "border border-sand-200 bg-card text-clay-600 active:bg-sand-100"
            }`}
          >
            {l.label}
          </a>
        ))}
        {booking.place && <MapLink place={booking.place} />}
        {booking.dayIdxs?.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpenDay(i)}
            className="rounded-lg border border-sand-200 bg-card px-4 py-2 text-[13px] font-medium text-ink-soft active:bg-sand-100"
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[10.5px] leading-snug text-ink-faint">
        Calls, maps and this page work offline · website links need wifi.
      </p>
    </section>
  );
}
