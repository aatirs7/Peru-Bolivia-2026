"use client";

import { useState } from "react";

const PAGES = 8;
const PDF_HREF = "/Peru-Bolivia_2026_Itinerary.pdf";
const FILE_NAME = "Peru-Bolivia_2026_Itinerary.pdf";

/**
 * Save the PDF to the device. On phones the share sheet opens with
 * "Save to Files" (a plain <a download> just opens the viewer on iOS);
 * elsewhere a blob download fires. The PDF itself comes from the service
 * worker cache, so this works fully offline.
 */
async function savePdf(setBusy: (b: boolean) => void): Promise<void> {
  setBusy(true);
  try {
    const res = await fetch(PDF_HREF);
    const blob = await res.blob();
    const file = new File([blob], FILE_NAME, { type: "application/pdf" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Peru & Bolivia 2026 Itinerary" });
        return;
      } catch (err) {
        // user closed the share sheet · not an error
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch {
    // last resort: open the viewer
    window.open(PDF_HREF, "_blank");
  } finally {
    setBusy(false);
  }
}

/**
 * The original itinerary PDF, scrollable in-app. Pages are pre-rendered to
 * images at build time (public/itinerary/page-N.png) so they display reliably
 * inside the installed PWA on iOS and are precached for offline.
 */
export default function PdfPanel() {
  const [busy, setBusy] = useState(false);
  return (
    <section aria-label="Itinerary PDF" className="text-center">
      <h2 className="text-[20px] font-semibold tracking-tight text-ink">
        Itinerary PDF
      </h2>
      <p className="mt-1 text-[12.5px] text-ink-faint">
        The original {PAGES}-page document · scroll to read, or save a copy to your phone.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => void savePdf(setBusy)}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-clay-600 px-5 text-[14px] font-semibold text-white shadow-lift active:bg-clay-700 disabled:opacity-60"
      >
        {busy ? "Preparing..." : "Save PDF to device"}
      </button>
      <p className="mt-1.5 text-[10.5px] text-ink-faint">
        On iPhone the share sheet opens · choose Save to Files.
      </p>

      <div className="mt-5 space-y-3">
        {Array.from({ length: PAGES }, (_, i) => (
          <img
            key={i}
            src={`/itinerary/page-${i + 1}.png`}
            alt={`Itinerary page ${i + 1} of ${PAGES}`}
            loading={i < 2 ? "eager" : "lazy"}
            className="w-full rounded-xl border border-sand-200/80 bg-white shadow-card"
          />
        ))}
      </div>
    </section>
  );
}
