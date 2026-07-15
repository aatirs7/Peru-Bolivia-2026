# SPEC — Siddiqui Peru & Bolivia 2026 (offline PWA itinerary)

A phone-first, **offline-capable** Progressive Web App that shows the family's 18-day
Peru + Bolivia itinerary. Installs to the home screen, opens to **today**, and has two
views toggled in the header: **Family** (clean daily schedule) and **Trip Lead**
(everything + confirmation numbers, PINs, booking sources, a bookings summary, and a
"things to confirm" list).

This document is the working brief for extending the app in Claude Code. The repo already
builds and static-exports; treat it as the source of truth and edit in place.

---

## Stack & why

- **Next.js 14 (App Router) + `output: "export"`** → pure static site, deploys anywhere (Vercel).
- **`@ducanh2912/next-pwa`** → service worker + Workbox precache for offline; App-Router friendly.
- **Tailwind CSS v3** → styling, palette defined in `tailwind.config.ts`.
- **No database, no API, no auth.** All trip content is static TypeScript in `src/data/trip.ts`.
  This is deliberate: the app must work with zero connectivity in the Andes, so there is
  nothing to fetch at runtime. Do **not** introduce Neon/Clerk/etc. here.

## Offline model (the whole point)

- On first load (online), the service worker precaches the app shell + all assets.
- After that it opens fully offline. There is no runtime data fetching to fail.
- SW is **disabled in `next dev`** (see `next.config.mjs`) — test offline with a production
  build: `npm run build && npx serve out` then toggle the browser offline.
- iOS reality: each person installs on their own device (Share → Add to Home Screen) and must
  open it **once on Wi-Fi/data** before going remote. iOS may evict caches after long disuse,
  so the family brief is "install + open the night before departure."

---

## Architecture

```
src/
  types.ts                 Data model (Trip, Day, BookingCard, etc.)
  data/trip.ts             SINGLE SOURCE OF TRUTH — all 18 days, summary, todos
  lib/
    useToday.ts            todayIndex(): which day to open based on device date
    useView.ts             useView(): "family" | "lead", persisted in localStorage
  app/
    layout.tsx             PWA meta (manifest, apple-web-app, theme color)
    page.tsx               Header + view toggle + lead tabs + day rail + today logic
    globals.css            Tailwind + safe-area + rail scroll helpers
  components/
    DayView.tsx            Renders one day (heading, cards, warn, schedule, note)
    BookingCard.tsx        A flight/stay/tour/transport/gap card; hides lead-only fields in Family view
    StatusPill.tsx         confirmed / booked / to_confirm / gap pill
    LeadPanels.tsx         SummaryPanel + TodoPanel (Trip-Lead tabs only)
public/
  manifest.json            PWA manifest
  icons/                   app icons (192/512/maskable/apple-touch/favicon)
```

### The Family vs Trip-Lead split (core requirement)

- The toggle lives in the header and is a **per-device** setting (localStorage key `trip.view`).
  No PIN, no accounts — it's a visible toggle anyone can flip.
- **Family view** shows, per card: title, status pill, and `lines[]` only.
- **Trip Lead view** additionally shows: `ref` (confirmation/PNR), `pin`, `bookedVia`,
  `leadNote` (passenger of record, balances due, contacts) — plus two extra header tabs:
  **Bookings** (summary) and **To Confirm** (gaps/notes).
- Implementation: `BookingCard` receives `view` and gates the lead-only block on `view === "lead"`.
  The lead tabs render only when `view === "lead"`; switching back to Family forces `tab = "day"`.

### "Today" logic (`lib/useToday.ts`)

- `todayIndex(now)` compares the **local** device date (YYYY-MM-DD, no UTC drift) to the trip window:
  before the trip → Day 1; after → Day 18; during → the matching day.
- `page.tsx` resolves this on mount (client only, to avoid hydration mismatch) and jumps there.
  A **Today** button resets to it; the day rail + ‹ › move between days.

---

## Editing content

Everything is in **`src/data/trip.ts`**. Shapes are in `src/types.ts`.

- Add/adjust a booking → edit the relevant `Day.cards[]`. Put family-safe detail in `lines`,
  and sensitive/ops detail in `ref` / `pin` / `bookedVia` / `leadNote` (lead-only).
- `status`: `"confirmed" | "booked" | "to_confirm" | "gap"` drives the pill color.
- Keep `summary` and `todos` in sync when a booking's status changes.
- Dates are ISO `YYYY-MM-DD`; keep `days[]` in chronological order (the rail and today logic
  assume it).

### Known gaps to resolve (mirror of the itinerary's amber/red items)

1. **La Paz lodging Aug 7–9** — currently a `gap` card on Day 16. Add the booking when made.
2. **Uyuni lodging Aug 5–7** — `gap` card on Day 14; likely Hotel Nido del Flamenco, confirm.
3. **Cusco first-leg hotel (Jul 26–30)** — `to_confirm` card on Day 4; details missing.
4. **Cusco ⇄ Ollantaytambo transport** — noted in Day 8/10 `warn`; add as `transport` cards if booked.

When these are filled, flip statuses to `confirmed`, add refs, and update `summary`/`todos`.

---

## Possible enhancements (not built yet — pick as needed)

- **Swipe navigation** between days (touch/drag) in addition to the rail.
- **Offline map pins**: a static list of lat/lng for hotels, stations, airports rendered with a
  bundled tile-free map (or just "open in Google Maps" deep links, which work offline to launch
  the Maps app with a cached area). Keep it dependency-light.
- **Packing / passport checklist** with localStorage check state (per device).
- **Countdown** to departure on Day 1.
- **Per-traveler seat column** once seat assignments exist.
- **"Updated" stamp** + a manual "check for update" that calls `navigator.serviceWorker` update.

Guardrails: no runtime network dependency for core itinerary; keep bundle small; keep the
Family view free of confirmation numbers/PINs.

---

## Commands

```bash
npm install
npm run dev            # SW disabled; iterate on UI
npm run build          # static export to ./out  (SW enabled)
npx serve out          # preview the production build locally, test offline
```

## Deploy (Vercel)

- Framework preset: **Next.js**. With `output: "export"` Vercel serves the static `out/`.
- No env vars. Push the repo, import in Vercel, deploy. Share the URL with the family.
- Alternatively any static host (Netlify, GitHub Pages, Cloudflare Pages) works — it's just files.
