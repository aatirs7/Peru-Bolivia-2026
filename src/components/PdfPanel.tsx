const PAGES = 9;
const PDF_HREF = "/Peru-Bolivia_2026_Itinerary.pdf";

/**
 * The original itinerary PDF, scrollable in-app. Pages are pre-rendered to
 * images at build time (public/itinerary/page-N.png) so they display reliably
 * inside the installed PWA on iOS and are precached for offline.
 */
export default function PdfPanel() {
  return (
    <section aria-label="Itinerary PDF" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">
        Itinerary PDF
      </h2>
      <p className="mt-1 text-[12.5px] text-ink-faint">
        The original 9-page document · scroll to read, or save a copy to Files.
      </p>

      <a
        href={PDF_HREF}
        download="Peru-Bolivia_2026_Itinerary.pdf"
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-clay-600 px-5 text-[14px] font-semibold text-white shadow-lift active:bg-clay-700"
      >
        Download PDF
      </a>

      <div className="mt-5 space-y-3">
        {Array.from({ length: PAGES }, (_, i) => (
          <img
            key={i}
            src={`/itinerary/page-${i + 1}.png`}
            alt={`Itinerary page ${i + 1} of ${PAGES}`}
            loading={i < 2 ? "eager" : "lazy"}
            className="w-full rounded-xl border border-sand-200/80 bg-card shadow-card"
          />
        ))}
      </div>
    </section>
  );
}
