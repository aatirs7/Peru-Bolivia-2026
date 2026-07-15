import type { Place } from "@/types";
import { PLACES } from "./trip";

export type ContactCountry = "Peru" | "Bolivia" | "USA";

export interface Contact {
  name: string;
  /** e.g. "Trip lead", "Aguas Calientes · Jul 30–Aug 1", "Salt-flats tour operator". */
  role?: string;
  country?: ContactCountry;
  /** Digits for the tel: link, e.g. "+18656224841". */
  phone?: string;
  /** Pretty display of the number, e.g. "+1 865 622 4841". */
  phoneLabel?: string;
  email?: string;
  address?: string;
  place?: Place;
  note?: string;
  pinned?: boolean;
}

/** Big red quick-dial numbers · shown first, grouped by country. */
export interface EmergencyNumber {
  country: ContactCountry;
  service: string;
  number: string;
}

export const emergencyNumbers: EmergencyNumber[] = [
  { country: "Peru", service: "Police", number: "105" },
  { country: "Peru", service: "Medical (SAMU)", number: "106" },
  { country: "Bolivia", service: "Police", number: "110" },
  { country: "Bolivia", service: "Ambulance", number: "118" },
];

export const familyContacts: Contact[] = [
  // Add each traveler's phone number so anyone separated can reach the group.
  { name: "Adeel", role: "Trip lead · bookings & contact", pinned: true },
  { name: "Wajiha" },
  { name: "Abeer" },
  { name: "Aatir" },
  { name: "Aashir" },
  { name: "Ammaar" },
];

export const stayContacts: Contact[] = [
  {
    name: "Home in Miraflores (host Britt)",
    role: "Lima · Jul 23–26",
    country: "Peru",
    address: "Av. 28 de Julio 639, Miraflores, Lima",
    place: PLACES.miraflores,
    note: "Contact host via the Airbnb app (message thread works on wifi).",
  },
  {
    name: "Cusco Hotel · first leg",
    role: "Cusco · Jul 26–30",
    country: "Peru",
    note: "Details still to be confirmed · add name, address & phone once known.",
  },
  {
    name: "Mapi Garden's Machupicchu",
    role: "Aguas Calientes · Jul 30–Aug 1",
    country: "Peru",
    place: PLACES.mapiGardens,
    note: "Phone is on the Booking.com confirmation (conf 6093685720).",
  },
  {
    name: "RHOUSE Cusco",
    role: "Cusco · Aug 1–3",
    country: "Peru",
    place: PLACES.rhouse,
    note: "Phone is on the Booking.com confirmation (conf 5057021282).",
  },
  {
    name: "Kawsay Apart",
    role: "La Paz · Aug 3–5",
    country: "Bolivia",
    place: PLACES.kawsay,
    note: "Phone is on the Booking.com confirmation (conf 5675367516).",
  },
  {
    name: "Uyuni lodging",
    role: "Uyuni · Aug 5–7",
    country: "Bolivia",
    place: PLACES.nidoFlamenco,
    note: "Likely Hotel Nido del Flamenco · to be confirmed.",
  },
  {
    name: "La Paz lodging · final nights",
    role: "La Paz · Aug 7–9",
    country: "Bolivia",
    note: "Not booked yet.",
  },
];

export const operatorContacts: Contact[] = [
  {
    name: "Machu Picchu Center",
    role: "Machu Picchu Circuit 2 · Jul 30–31 · 24/7 line",
    country: "Peru",
    phone: "+18656224841",
    phoneLabel: "+1 865 622 4841",
    email: "MachuPicchu.Center@gmail.com",
  },
  {
    name: "Hotel Nido del Flamenco",
    role: "Salar de Uyuni tour · Aug 6",
    country: "Bolivia",
    phone: "+59168779297",
    phoneLabel: "+591 687 79297",
    place: PLACES.nidoFlamenco,
  },
  {
    name: "Mystic Lands Peru",
    role: "Rainbow Mountain ATV tour · Jul 28",
    country: "Peru",
    note: "Contact details are on receipt ML3526LC.",
  },
];

export const officialContacts: Contact[] = [
  {
    name: "U.S. Embassy Lima",
    role: "American Citizen Services · 24/7 emergency line",
    country: "Peru",
    phone: "+5116182000",
    phoneLabel: "+51 1 618-2000",
    email: "LimaACS@state.gov",
    address: "Av. La Encalada cdra. 17, Surco (Monterrico), Lima",
    place: { type: "tour", label: "U.S. Embassy Lima", lat: -12.0987, lng: -76.9718 },
  },
  {
    name: "U.S. Embassy La Paz",
    role: "American Citizen Services",
    country: "Bolivia",
    phone: "+59122168000",
    phoneLabel: "+591 2 216-8000",
    address: "Av. Arce 2780, La Paz",
    place: { type: "tour", label: "U.S. Embassy La Paz", lat: -16.5106, lng: -68.1252 },
    note: "After-hours emergencies: +591 2 216-8500.",
  },
  {
    name: "U.S. State Dept · Overseas Citizens Services",
    role: "24/7, from abroad",
    country: "USA",
    phone: "+12025014444",
    phoneLabel: "+1 202 501 4444",
  },
];
