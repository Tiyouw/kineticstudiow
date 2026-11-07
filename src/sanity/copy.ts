/**
 * Page copy in the CMS, generated from the dictionaries in src/i18n so the two can't drift.
 * A text becomes { id, en }; a list becomes { id: [...], en: [...] }; groups nest.
 * Reading merges field by field: an empty CMS field falls back to the text in code.
 */
import type { Locale } from "@/lib/i18n";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Field = Record<string, any>;

const LABELS: Record<string, string> = {
  metaTitle: "Judul di Google / tab browser",
  lede: "Paragraf pembuka",
  eyebrow: "Label kecil di atas judul",
  title: "Judul",
  sub: "Subjudul",
  desc: "Deskripsi",
  ctaTitle: "Judul ajakan (CTA)",
  ctaSub: "Teks ajakan (CTA)",
};
const human = (k: string) => LABELS[k] ?? k.replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
const isLong = (s: string) => s.length > 70 || s.includes("\n");
const hint = (s: string) => (/\{\w+\}/.test(s) ? "Biarkan kata di dalam {kurung kurawal} apa adanya: diisi otomatis." : undefined);

/** A plain (not localized) field, for items inside a list. */
function plain(name: string, sample: Json): Field | null {
  if (typeof sample === "string") {
    const f: Field = { name, title: human(name), type: isLong(sample) ? "text" : "string", description: hint(sample) };
    if (name === "key") Object.assign(f, { readOnly: true, hidden: true });
    return f;
  }
  if (Array.isArray(sample)) return { name, title: human(name), type: "array", of: [item(sample)] };
  if (sample && typeof sample === "object") return { name, title: human(name), type: "object", fields: objFields(sample, plain) };
  return null;
}
function objFields(o: { [k: string]: Json }, make: (n: string, v: Json) => Field | null) {
  return Object.entries(o).map(([k, v]) => make(k, v)).filter(Boolean) as Field[];
}
/** The item type of a list, from all its samples (items may have different keys). */
function item(samples: Json[]): Field {
  const first = samples[0];
  if (first && typeof first === "object" && !Array.isArray(first)) {
    const merged: { [k: string]: Json } = {};
    for (const s of samples) Object.assign(merged, s as object);
    const fields = objFields(merged, plain);
    const titleKey = fields.find((f) => f.type === "string" && !f.hidden)?.name;
    return { type: "object", name: "item", fields, preview: titleKey ? { select: { title: titleKey } } : undefined };
  }
  return { type: isLong(String(first ?? "")) ? "text" : "string" };
}

/** A localized field, from the en and id samples. */
export function localized(name: string, en: Json, id: Json): Field | null {
  if (typeof en === "string") {
    const t = isLong(en) || isLong(String(id)) ? "text" : "string";
    return {
      name, title: human(name), type: "object", description: hint(en), options: { columns: 2 },
      fields: [{ name: "id", title: "Indonesia", type: t, rows: 3 }, { name: "en", title: "English", type: t, rows: 3 }],
    };
  }
  if (Array.isArray(en)) {
    const of = [item([...en, ...((id as Json[]) ?? [])])];
    return { name, title: human(name), type: "object", fields: [{ name: "id", title: "Indonesia", type: "array", of }, { name: "en", title: "English", type: "array", of }] };
  }
  if (en && typeof en === "object") {
    const idObj = (id ?? {}) as { [k: string]: Json };
    const fields = Object.entries(en).map(([k, v]) => localized(k, v, idObj[k])).filter(Boolean) as Field[];
    return { name, title: human(name), type: "object", options: { collapsible: true, collapsed: true }, fields };
  }
  return null;
}

/** Fields of a copy document. */
export function copyFields(dict: { en: object; id: object }): Field[] {
  const en = dict.en as { [k: string]: Json }, id = dict.id as { [k: string]: Json };
  return Object.keys(en).map((k) => localized(k, en[k], id[k])).filter(Boolean) as Field[];
}

// ---- values ----

let n = 0;
const withKeys = (arr: Json[]) => arr.map((v) => (v && typeof v === "object" && !Array.isArray(v) ? { _key: `k${(n++).toString(36)}`, ...v } : v));

/** The CMS document body holding the code's current texts (used to seed the CMS). */
export function toCms(en: Json, id: Json): Json {
  if (typeof en === "string") return { id: String(id ?? en), en };
  if (Array.isArray(en)) return { id: withKeys((id as Json[]) ?? en), en: withKeys(en) };
  if (en && typeof en === "object") {
    const out: { [k: string]: Json } = {};
    for (const [k, v] of Object.entries(en)) out[k] = toCms(v, (id as { [k: string]: Json } | null)?.[k] ?? v);
    return out;
  }
  return en;
}

const strip = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(strip) : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith("_")).map(([k, x]) => [k, strip(x)]))
    : v;

/** The code's text with every filled-in CMS field laid over it. */
export function mergeCopy<T>(base: T, cms: unknown, locale: Locale): T {
  const c = cms as Record<string, unknown> | null | undefined;
  if (typeof base === "string") {
    const v = c?.[locale];
    return (typeof v === "string" && v.trim() ? v : base) as T;
  }
  if (Array.isArray(base)) {
    const v = c?.[locale];
    return (Array.isArray(v) && v.length ? strip(v) : base) as T;
  }
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base)) out[k] = mergeCopy(v, c?.[k], locale);
    return out as T;
  }
  return base;
}
