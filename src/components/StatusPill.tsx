import type { Status } from "@/types";

const styles: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-andes-100 text-andes-800" },
  booked: { label: "Booked", cls: "bg-gold-100 text-gold-600" },
  to_confirm: { label: "To confirm", cls: "bg-clay-100 text-clay-700" },
  gap: { label: "Gap", cls: "bg-alert-100 text-alert-600" },
};

export default function StatusPill({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
