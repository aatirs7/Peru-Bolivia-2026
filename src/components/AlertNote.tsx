import { CircleAlert } from "lucide-react";
import RichText from "./RichText";

/**
 * The red-orange "don't forget" badge · used on booking cards and time blocks.
 * Added by the trip lead per item; visible to everyone.
 */
export default function AlertNote({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p
      className={`flex items-start justify-center gap-1.5 rounded-lg border border-alert-600/25 bg-alert-600/5 px-2.5 py-1.5 text-[12px] font-medium leading-snug text-alert-600 dark:bg-alert-600/10 ${className}`}
    >
      <CircleAlert size={13} strokeWidth={2} className="mt-[1px] shrink-0" aria-hidden />
      <span className="text-left">
        <RichText text={text} />
      </span>
    </p>
  );
}
