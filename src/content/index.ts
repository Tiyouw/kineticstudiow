/**
 * Content access. Everything editable comes from Sanity (the Studio at /studio);
 * pages only call these getters.
 */
import { cache } from "react";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/client";
import { mergeCopy } from "@/sanity/copy";
import { DICTS, type Copy, type CopyKey } from "@/i18n/dicts";
import type { Locale } from "@/lib/i18n";
import { DEFAULT_WA, waHref, waText, type WaConfig, type WaData, type WaKind } from "@/lib/whatsapp";
import type { ClientMark, Product, Project, Testimonial } from "./types";

export * from "./types";

/** Sanity image URL, resized and served as WebP/AVIF where the browser takes it. */
const IMG = (f: string) => `"${f}": select(defined(${f}.asset) => ${f}.asset->url + "?auto=format&fit=max&w=1400", null)`;
const GALLERY = `"gallery": coalesce(gallery[defined(asset)].asset->url + "?auto=format&fit=max&w=1400", [])`;

const PRODUCT = groq`{ no, "slug": slug.current, name, priceIdr, "priceUsd": coalesce(priceUsd, 0), wasIdr, "sold": coalesce(sold, false), ${IMG("image")}, ${GALLERY}, "tone": coalesce(tone, ""), "isPlaceholder": coalesce(isPlaceholder, false) }`;

type Raw<T> = Omit<T, "gallery"> & { gallery: string[] };
const fixProduct = (p: Raw<Product>): Product => ({
  ...p,
  wasIdr: p.wasIdr ?? undefined,
  image: p.image ?? "/assets/badge-full.png",
  gallery: p.gallery.length ? p.gallery : [p.image ?? "/assets/badge-full.png"],
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const rows = await sanityFetch<Raw<Product>[]>(groq`*[_type == "product" && defined(slug.current)] | order(no asc) ${PRODUCT}`);
  return rows.map(fixProduct);
});

export async function getProduct(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await sanityFetch<Raw<Project>[]>(
    groq`*[_type == "project"] | order(id asc) { id, title, category, year, client, services, description, ${IMG("image")}, ${GALLERY}, "tone": coalesce(tone, ""), "real": coalesce(real, true) }`,
  );
  const l = (v: unknown) => ({ id: "", en: "", ...(v as object) });
  return rows.map((p) => ({
    ...p,
    title: l(p.title), year: l(p.year), client: l(p.client), services: l(p.services), description: l(p.description),
    image: p.image ?? "/assets/badge-full.png",
    gallery: p.gallery.length ? p.gallery : [p.image ?? "/assets/badge-full.png"],
  }));
});

export const getClientMarks = cache(async (): Promise<ClientMark[]> => {
  const rows = await sanityFetch<(ClientMark & { logo: string | null })[]>(
    groq`*[_type == "clientMark"] | order(order asc) { name, "variant": coalesce(variant, 1), "logo": logo.asset->url }`,
  );
  return rows.map((m) => ({ ...m, logo: m.logo ?? undefined }));
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  sanityFetch<Testimonial[]>(groq`*[_type == "testimonial"] | order(order asc) { quote, who, "isPlaceholder": coalesce(isPlaceholder, false) }`),
);

const getCopyDoc = cache(async (key: CopyKey) => sanityFetch<Record<string, unknown> | null>(groq`*[_id == $id][0]`, { id: `copy_${key}` }));

/** A page's texts: the dictionary in code, with whatever was edited in the Studio laid over it. */
export async function getCopy<K extends CopyKey>(key: K, locale: Locale): Promise<Copy<K>> {
  const doc = await getCopyDoc(key);
  return mergeCopy(DICTS[key][locale] as Copy<K>, doc, locale);
}

/** WhatsApp number and message templates. */
export const getWa = cache(async (): Promise<WaConfig> => {
  const s = await sanityFetch<{ waNumber?: string; templates?: Record<string, Record<string, string>> } | null>(groq`*[_id == "settings"][0]{ waNumber, templates }`);
  const templates = { ...DEFAULT_WA.templates };
  for (const k of Object.keys(templates) as (keyof typeof templates)[]) {
    templates[k] = { id: s?.templates?.[k]?.id?.trim() || templates[k].id, en: s?.templates?.[k]?.en?.trim() || templates[k].en };
  }
  return { number: s?.waNumber?.trim() || DEFAULT_WA.number, templates };
});

export const formatIdr = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const formatUsd = (n: number) => "$" + n;

/** WhatsApp links for server components: `const w = await getWaLinks(); w.href("order", locale, data)`. */
export async function getWaLinks() {
  const cfg = await getWa();
  return {
    cfg,
    href: (kind: WaKind, locale: Locale, data?: WaData) => waHref(kind, locale, data, cfg),
    text: (kind: WaKind, locale: Locale, data?: WaData) => waText(kind, locale, data, cfg),
  };
}
