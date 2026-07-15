/**
 * Time-of-day greeting from the device's local clock only — no network,
 * no timezone service. Works fully offline.
 *
 * 5:00–11:59 → morning · 12:00–16:59 → afternoon · 17:00–20:59 → evening ·
 * 21:00–4:59 → evening (calm late-night default).
 */
export function greetingFor(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

/** "Good morning, Ammaar!" — or a neutral "Welcome!" when no name is set. */
export function greetingLine(name: string | null, now: Date = new Date()): string {
  return name ? `${greetingFor(now)}, ${name}!` : "Welcome!";
}
