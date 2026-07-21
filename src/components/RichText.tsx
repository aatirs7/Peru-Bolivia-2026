import { Fragment, type ReactNode } from "react";

/**
 * Renders itinerary text with clickable links · no markdown engine, no deps.
 *
 * Two forms are understood:
 *   [Meeting point](https://maps.app.goo.gl/xyz)   · labelled link
 *   https://maps.app.goo.gl/xyz                    · bare url, pasted as-is
 *
 * Bare links (and mailto:/tel:) are shown by their host so a long Google Maps
 * url can't blow out the layout. Everything else renders as plain text, so old
 * content is untouched.
 */

const LINK =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)|(https?:\/\/[^\s<>]+|www\.[^\s<>]+|mailto:\S+|tel:\+?[\d\s().-]{6,})/gi;

/** Trailing sentence punctuation isn't part of a pasted url. */
function trimUrl(u: string): { url: string; tail: string } {
  const m = u.match(/[.,;:!?)]+$/);
  if (!m) return { url: u, tail: "" };
  return { url: u.slice(0, -m[0].length), tail: m[0] };
}

function shortLabel(url: string): string {
  if (url.startsWith("mailto:")) return url.slice(7);
  if (url.startsWith("tel:")) return url.slice(4);
  try {
    const u = new URL(url.startsWith("www.") ? `https://${url}` : url);
    const host = u.hostname.replace(/^www\./, "");
    return u.pathname.length > 1 || u.search ? `${host}/…` : host;
  } catch {
    return url;
  }
}

function href(url: string): string {
  return url.startsWith("www.") ? `https://${url}` : url;
}

const linkCls =
  "break-words font-medium text-clay-600 underline decoration-clay-300 underline-offset-2 dark:text-clay-400";

export function hasLink(text: string): boolean {
  LINK.lastIndex = 0;
  return LINK.test(text);
}

export default function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <a key={m.index} href={href(m[2])} target="_blank" rel="noreferrer" className={linkCls}>
          {m[1]}
        </a>,
      );
    } else {
      const { url, tail } = trimUrl(m[3]);
      out.push(
        <a key={m.index} href={href(url)} target="_blank" rel="noreferrer" className={linkCls}>
          {shortLabel(url)}
        </a>,
      );
      if (tail) out.push(tail);
    }
    last = m.index + m[0].length;
  }
  if (last === 0) return <>{text}</>;
  if (last < text.length) out.push(text.slice(last));
  return (
    <>
      {out.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}
