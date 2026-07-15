import type { Status } from "@/types";

const styles: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "border-andes-400/40 text-andes-600" },
  booked: { label: "Booked", cls: "border-gold-400/40 text-gold-600" },
  to_confirm: { label: "To confirm", cls: "border-clay-300/60 text-clay-600" },
  gap: { label: "Gap", cls: "border-alert-600/40 text-alert-600" },
};

export default function StatusPill({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className={`inline-block shrink-0 rounded-md border px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[0.08em] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
