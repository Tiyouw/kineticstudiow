import type { ClientMark, Product, Project, Testimonial } from "./types";

/* Placeholder content until the CMS lands. Images are brand-asset stand-ins. */

const A = (f: string) => `/assets/${f}`;

export const products: Product[] = [
  { no: "012", slug: "burger-bros", name: "BURGER BROS", priceIdr: 1490000, priceUsd: 89, wasIdr: 1900000, sold: false, image: A("mascot-full-red.png"), gallery: [A("mascot-full-red.png"), A("mascot-full.png"), A("mascot-head-circle.png"), A("badge-full.png")], tone: "", isPlaceholder: true },
  { no: "013", slug: "eagle-strikers", name: "EAGLE STRIKERS", priceIdr: 1290000, priceUsd: 79, sold: false, image: A("mascot-full-white.png"), gallery: [A("mascot-full-white.png")], tone: "art-ink", isPlaceholder: true },
  { no: "014", slug: "howdy-woody", name: "HOWDY WOODY", priceIdr: 1690000, priceUsd: 99, wasIdr: 2000000, sold: false, image: A("peace-hand.png"), gallery: [A("peace-hand.png")], tone: "", isPlaceholder: true },
  { no: "015", slug: "slice-haven", name: "SLICE HAVEN", priceIdr: 1490000, priceUsd: 89, sold: true, image: A("mascot-head-circle.png"), gallery: [A("mascot-head-circle.png")], tone: "", isPlaceholder: true },
  { no: "016", slug: "kopi-kakek", name: "KOPI KAKEK", priceIdr: 1190000, priceUsd: 72, sold: false, image: A("pennant-flag-filled.png"), gallery: [A("pennant-flag-filled.png")], tone: "art-red", isPlaceholder: true },
  { no: "017", slug: "rusty-wrench", name: "RUSTY WRENCH", priceIdr: 1390000, priceUsd: 85, wasIdr: 1750000, sold: false, image: A("badge-full.png"), gallery: [A("badge-full.png")], tone: "", isPlaceholder: true },
  { no: "018", slug: "noodle-ninja", name: "NOODLE NINJA", priceIdr: 1290000, priceUsd: 79, sold: true, image: A("mascot-full.png"), gallery: [A("mascot-full.png")], tone: "", isPlaceholder: true },
  { no: "019", slug: "surf-sambal", name: "SURF SAMBAL", priceIdr: 990000, priceUsd: 59, wasIdr: 1250000, sold: false, image: A("peace-hand-filled.png"), gallery: [A("peace-hand-filled.png")], tone: "art-ink", isPlaceholder: true },
];

const ph = { id: "Project placeholder", en: "Project placeholder" };
const yph = { id: "Tahun placeholder", en: "Year placeholder" };
const cph = { id: "Nama klien placeholder", en: "Client name placeholder" };
const dph = {
  id: "Deskripsi placeholder: ceritakan brief, karakternya, dan di mana dipakai.",
  en: "Description placeholder: the brief, the character, and where it lives.",
};

export const projects: Project[] = [
  {
    id: "01", category: "brand", real: true, image: A("badge-full.png"), tone: "",
    title: { id: "Identitas brand Kinetic", en: "Kinetic brand identity" },
    year: { id: "2026", en: "2026" },
    client: { id: "Kinetic Studiow (studio sendiri)", en: "Kinetic Studiow (own studio)" },
    services: { id: "Badge, maskot, wordmark script, pennant", en: "Badge, mascot, script wordmark, pennant" },
    description: {
      id: "Identitas studio sendiri: badge, maskot Blue Jay, wordmark script, dan pennant.",
      en: "The studio's own identity: badge, Blue Jay mascot, script wordmark and pennant.",
    },
    gallery: [A("mascot-full.png"), A("wordmark-script.png"), A("pennant-flag.png")],
  },
  { id: "02", category: "mascot", real: false, image: A("mascot-full-white.png"), tone: "art-ink", title: ph, year: yph, client: cph, services: { id: "Desain maskot", en: "Mascot design" }, description: dph, gallery: [A("mascot-full-white.png"), A("mascot-head-circle-filled.png"), A("mascot-full-red.png")] },
  { id: "03", category: "lettering", real: false, image: A("wordmark-script.png"), tone: "", title: ph, year: yph, client: cph, services: { id: "Lettering custom", en: "Custom lettering" }, description: dph, gallery: [A("wordmark-script.png"), A("wordmark-script-white.png"), A("pennant-flag.png")] },
  { id: "04", category: "merch", real: false, image: A("peace-hand-filled.png"), tone: "art-red", title: ph, year: yph, client: cph, services: { id: "Grafis merch", en: "Merch graphics" }, description: dph, gallery: [A("peace-hand-filled.png"), A("peace-hand.png"), A("badge-full.png")] },
  { id: "05", category: "mascot", real: false, image: A("mascot-head-circle.png"), tone: "", title: ph, year: yph, client: cph, services: { id: "Desain maskot", en: "Mascot design" }, description: dph, gallery: [A("mascot-head-circle.png"), A("mascot-full.png"), A("mascot-full-red.png")] },
  { id: "06", category: "brand", real: false, image: A("badge-full-white.png"), tone: "art-ink", title: ph, year: yph, client: cph, services: { id: "Identitas brand", en: "Brand identity" }, description: dph, gallery: [A("badge-full-white.png"), A("wordmark-script-white.png"), A("mascot-head-circle-filled.png")] },
  { id: "07", category: "lettering", real: false, image: A("pennant-flag-red.png"), tone: "", title: ph, year: yph, client: cph, services: { id: "Lettering custom", en: "Custom lettering" }, description: dph, gallery: [A("pennant-flag-red.png"), A("pennant-flag.png"), A("wordmark-script.png")] },
  { id: "08", category: "merch", real: false, image: A("mascot-full-red.png"), tone: "", title: ph, year: yph, client: cph, services: { id: "Grafis merch", en: "Merch graphics" }, description: dph, gallery: [A("mascot-full-red.png"), A("peace-hand.png"), A("badge-full.png")] },
];

export const clientMarks: ClientMark[] = [
  { name: "Burger Bros", variant: 1 },
  { name: "Kopi Tua", variant: 2 },
  { name: "Rusty Garage", variant: 3 },
  { name: "slice haven", variant: 4 },
  { name: "Fixie Jember", variant: 5 },
  { name: "Toko Lama", variant: 6 },
];

export const testimonials: Testimonial[] = [
  {
    quote: {
      en: "Our cafe finally has a face. People ask for the sticker before they ask for the menu.",
      id: "Kafe kami akhirnya punya wajah. Orang minta stikernya dulu sebelum minta menu.",
    },
    who: { en: "Client name, cafe owner", id: "Nama klien, pemilik kafe" },
    isPlaceholder: true,
  },
  {
    quote: {
      en: "He got our club's spirit from one voice note. The tees sold out at the first meet-up.",
      id: "Dari satu voice note dia langsung nangkep jiwa klub kami. Kaosnya habis di kopdar pertama.",
    },
    who: { en: "Client name, community", id: "Nama klien, komunitas" },
    isPlaceholder: true,
  },
];
