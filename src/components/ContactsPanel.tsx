"use client";

import {
  emergencyNumbers,
  familyContacts,
  officialContacts,
  operatorContacts,
  stayContacts,
  type Contact,
} from "@/data/contacts";
import { trip } from "@/data/trip";
import { todayIndex } from "@/lib/useToday";
import MapLink from "./MapLink";

/** Most recent stay on or before today — the "if separated" meeting point. */
function currentStay(): string | null {
  const idx = todayIndex();
  for (let i = idx; i >= 0; i--) {
    const stay = trip.days[i].cards.find(
      (c) => c.kind === "stay" && c.status !== "gap",
    );
    if (stay) return stay.title;
  }
  return null;
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold leading-snug text-ink">
            {contact.pinned && <span aria-hidden>⭐ </span>}
            {contact.name}
          </p>
          {contact.role && (
            <p className="mt-0.5 text-[12px] text-ink-faint">{contact.role}</p>
          )}
        </div>
        {contact.country && (
          <span className="shrink-0 rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            {contact.country}
          </span>
        )}
      </div>

      {contact.address && (
        <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">{contact.address}</p>
      )}
      {contact.note && (
        <p className="mt-1.5 text-[12.5px] italic leading-snug text-ink-faint">
          {contact.note}
        </p>
      )}

      {(contact.phone || contact.email || contact.place) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-andes-600 px-4 py-2 text-[14px] font-bold text-sand-50 active:bg-andes-800"
            >
              📞 {contact.phoneLabel ?? contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-andes-400 bg-white px-4 py-2 text-[13px] font-semibold text-andes-600 active:bg-andes-100"
            >
              ✉️ Email
            </a>
          )}
          {contact.place && <MapLink place={contact.place} />}
        </div>
      )}
    </div>
  );
}

function Group({ title, contacts }: { title: string; contacts: Contact[] }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
        {title}
      </h3>
      <div className="space-y-2.5">
        {contacts.map((c, i) => (
          <ContactRow key={i} contact={c} />
        ))}
      </div>
    </div>
  );
}

/**
 * The "phone at 5% battery, someone's lost" screen. Fully static, fully
 * offline — every affordance is a tel:/mailto:/maps href the OS handles.
 */
export default function ContactsPanel() {
  const meetAt = currentStay();

  return (
    <section aria-label="Emergency and contacts">
      <h2 className="font-display text-[24px] font-semibold text-ink">
        Emergency & contacts
      </h2>

      {meetAt && (
        <p className="mt-2 rounded-2xl bg-andes-100 px-4 py-3 text-[14px] font-semibold leading-snug text-andes-800">
          If separated: meet at {meetAt}.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {emergencyNumbers.map((e) => (
          <a
            key={`${e.country}-${e.number}`}
            href={`tel:${e.number}`}
            className="flex min-h-[72px] flex-col items-center justify-center rounded-2xl bg-alert-600 px-3 py-3 text-center text-sand-50 shadow-card active:opacity-90"
          >
            <span className="text-[22px] font-black leading-none">{e.number}</span>
            <span className="mt-1 text-[11.5px] font-bold uppercase tracking-wide opacity-90">
              {e.country} · {e.service}
            </span>
          </a>
        ))}
      </div>

      <Group title="Family" contacts={familyContacts} />
      <p className="mt-2 text-[11.5px] italic text-ink-faint">
        Add each traveler's phone number in <span className="font-mono">src/data/contacts.ts</span> so
        tap-to-call works if someone's separated.
      </p>
      <Group title="Stays" contacts={stayContacts} />
      <Group title="Tour operators" contacts={operatorContacts} />
      <Group title="Official / embassy" contacts={officialContacts} />

      <p className="mt-5 text-[11.5px] leading-snug text-ink-faint">
        Everything on this screen works with zero connectivity — phone numbers
        dial directly, and map links open your Maps app (download the offline
        areas first).
      </p>
    </section>
  );
}
