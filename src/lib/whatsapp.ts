import type { Locale } from "./i18n";
import { SOCIAL } from "./site";


export type WaKind = "general" | "order" | "ask" | "project" | "custom";

export interface WaData {
  no?: string;
  name?: string;
  price?: string;
  project?: string;
  // custom order brief
  brand?: string;
  business?: string;
  services?: string;
  style?: string;
  usage?: string;
  budget?: string;
  deadline?: string;
  notes?: string;
}

const T: Record<WaKind, Record<Locale, string>> = {
  general: {
    en: "Hi Kinetic Studiow, I'd like a mascot for my brand.\n\nBrand name:\nWhat we sell:\nWhere it will be used (logo, merch, signage):\nDeadline:\n\nSent from the Kinetic website",
    id: "Halo Kinetic Studiow, saya mau bikin maskot untuk brand saya.\n\nNama brand:\nJualan apa:\nAkan dipakai di (logo, merch, signage):\nDeadline:\n\nDikirim dari website Kinetic",
  },
  order: {
    en: "Hi Kinetic Studiow, I'd like to buy premade mascot #{no} {name} ({price}). Is it still available?\n\nMy name:\nBrand name:\n\nSent from the Kinetic website",
    id: "Halo Kinetic Studiow, saya mau beli maskot premade #{no} {name} ({price}). Masih tersedia?\n\nNama saya:\nNama brand:\n\nDikirim dari website Kinetic",
  },
  ask: {
    en: "Hi Kinetic Studiow, I have a question about premade mascot #{no} {name}:\n",
    id: "Halo Kinetic Studiow, saya mau tanya soal maskot premade #{no} {name}:\n",
  },
  project: {
    en: "Hi Kinetic Studiow, I saw \"{project}\" on your website and I'd like something like it for my brand.\n\nBrand name:\nWhat we sell:\n\nSent from the Kinetic website",
    id: "Halo Kinetic Studiow, saya lihat project \"{project}\" di website dan mau yang serupa untuk brand saya.\n\nNama brand:\nJualan apa:\n\nDikirim dari website Kinetic",
  },
  custom: {
    en: "Hi Kinetic Studiow, I'd like to order a custom design.\n\nName: {name}\nBrand: {brand}\nBusiness: {business}\nNeed: {services}\nStyle: {style}\nUsed on: {usage}\nBudget: {budget}\nDeadline: {deadline}\nNotes: {notes}\n\nSent from the Kinetic website",
    id: "Halo Kinetic Studiow, saya mau order desain custom.\n\nNama: {name}\nBrand: {brand}\nBidang usaha: {business}\nKebutuhan: {services}\nGaya: {style}\nDipakai untuk: {usage}\nBudget: {budget}\nDeadline: {deadline}\nCatatan: {notes}\n\nDikirim dari website Kinetic",
  },
};

export interface WaConfig {
  number: string;
  templates: Record<WaKind, Record<Locale, string>>;
}

/** The defaults in code. The number and templates edited in the Studio (getWa) replace them. */
export const DEFAULT_WA: WaConfig = { number: "6285156487036", templates: T };

/** The prefilled message. Empty placeholders become "-". */
export function waText(kind: WaKind, locale: Locale, data: WaData = {}, cfg: WaConfig = DEFAULT_WA): string {
  return cfg.templates[kind][locale].replace(/\{(\w+)\}/g, (_, k: keyof WaData) => {
    const v = data[k];
    return v === undefined || v === "" ? "-" : String(v);
  });
}

export function waHref(kind: WaKind, locale: Locale, data?: WaData, cfg: WaConfig = DEFAULT_WA): string {
  return `https://wa.me/${cfg.number}?text=${encodeURIComponent(waText(kind, locale, data, cfg))}`;
}

const SUBJECT: Record<WaKind, Record<Locale, string>> = {
  general: { en: "Mascot enquiry", id: "Tanya maskot" },
  order: { en: "Order: premade mascot #{no} {name}", id: "Order: maskot premade #{no} {name}" },
  ask: { en: "Question: premade mascot #{no} {name}", id: "Tanya: maskot premade #{no} {name}" },
  project: { en: "Something like \"{project}\"", id: "Mirip project \"{project}\"" },
  custom: { en: "Custom design brief", id: "Brief desain custom" },
};

/** The same message as an email to the studio, for buyers abroad who don't use WhatsApp. */
export function mailHref(kind: WaKind, locale: Locale, data: WaData = {}, cfg: WaConfig = DEFAULT_WA): string {
  const subject = SUBJECT[kind][locale].replace(/\{(\w+)\}/g, (_, k: keyof WaData) => String(data[k] ?? "")).replace(/\s+/g, " ").trim();
  const body = waText(kind, locale, data, cfg);
  return `mailto:${SOCIAL.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
