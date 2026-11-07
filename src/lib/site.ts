import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";

/** The public address. Vercel also serves *.vercel.app; canonical tags point search engines here. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kineticstudiow.my.id").replace(/\/$/, "");

export const SOCIAL = {
  instagram: "https://instagram.com/kinetic.studiow",
  behance: "https://behance.net/kineticstd",
  email: "kineticcreative666@gmail.com",
};

/** canonical + hreflang for a path without its locale ("" for home, "/shop", "/shop/x"). */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/id${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

/** A JSON-LD script body, safe to inline. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
