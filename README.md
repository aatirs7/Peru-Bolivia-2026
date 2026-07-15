# Peru & Bolivia 2026 · Siddiqui Family

Phone-first, **offline-capable** PWA showing the family's 18-day Peru + Bolivia
itinerary (Jul 23 – Aug 9, 2026). Opens to **today**, with a personalized
greeting homepage, per-device **Family / Trip Lead** views, map deep-links,
cache-then-refresh weather, and an offline Emergency & Contacts screen.

All trip content is static TypeScript in `src/data/trip.ts` (contacts in
`src/data/contacts.ts`) · no database, no API, no auth. See
`peru-trip-SPEC.md` for the full working brief.

## Commands

```bash
npm install
npm run dev            # SW disabled; iterate on UI
npm run build          # static export to ./out (SW enabled)
npx serve out          # preview production build; test offline
```

## Offline model

On first (online) load the service worker precaches the whole app; after that
it opens with zero connectivity. Each person installs it on their own device
(Share → Add to Home Screen on iOS) and opens it once on wifi the night before
departure.

## To fill in

- Family phone numbers → `src/data/contacts.ts` (tap-to-call on the SOS screen)
- Cusco first-leg hotel (Jul 26–30), Uyuni lodging confirmation, La Paz
  lodging Aug 7–9, Cusco ⇄ Ollantaytambo transport → `src/data/trip.ts`
  (flip `status`, add `ref`/`pin`, update `summary` + `todos`)

## Deploy

Vercel (framework preset: Next.js) or any static host · it's just files in `out/`.
