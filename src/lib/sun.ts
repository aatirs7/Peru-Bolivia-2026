import type { Coords } from "@/types";

/**
 * Sunrise / sunset for a location and date, computed entirely on-device
 * (SunCalc's algorithm). No network, works fully offline. Returned in the
 * destination's local clock so the times read naturally on the ground.
 */

const rad = Math.PI / 180;
const dayMs = 864e5;
const J1970 = 2440588;
const J2000 = 2451545;
const e = rad * 23.4397; // obliquity of the ecliptic
const h0 = -0.833 * rad; // standard sunrise/sunset altitude (refraction + disc)

const toDays = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970 - J2000;
const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d);

function eclipticLongitude(M: number): number {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372;
  return M + C + P + Math.PI;
}

const declination = (l: number) => Math.asin(Math.sin(0) * Math.cos(e) + Math.cos(0) * Math.sin(e) * Math.sin(l));
const julianCycle = (d: number, lw: number) => Math.round(d - 0.0009 - lw / (2 * Math.PI));
const approxTransit = (Ht: number, lw: number, n: number) => 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const hourAngle = (h: number, phi: number, d: number) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs);

/** UTC-4 for Bolivia (La Paz / Uyuni), UTC-5 for Peru · split cleanly by longitude. */
function tripOffsetHours(lng: number): number {
  return lng > -70 ? -4 : -5;
}

function fmt(utc: Date, offsetHours: number): string {
  const local = new Date(utc.getTime() + offsetHours * 3600_000);
  let h = local.getUTCHours();
  const m = local.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

export interface SunTimes {
  sunrise: string;
  sunset: string;
}

export function sunTimes(coords: Coords, dateISO: string): SunTimes {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const lw = rad * -coords.lng;
  const phi = rad * coords.lat;
  const days = toDays(date);
  const n = julianCycle(days, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);
  const w = hourAngle(h0, phi, dec);
  const Jset = solarTransitJ(approxTransit(w, lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  const off = tripOffsetHours(coords.lng);
  return { sunrise: fmt(fromJulian(Jrise), off), sunset: fmt(fromJulian(Jset), off) };
}
