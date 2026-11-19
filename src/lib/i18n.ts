export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

/** Site pages. Product pages use productHref(). */
export type PageKey = "home" | "work" | "shop" | "custom" | "about";

const PATHS: Record<PageKey, string> = {
  home: "",
  work: "/work",
  shop: "/shop",
  custom: "/custom-order",
  about: "/about",
};

/**
 * The public URL of a path in a language. English (the default) has no prefix: "/work";
 * Indonesian lives under /id: "/id/work". The middleware rewrites "/work" to the [lang]="en" route.
 */
export function localePath(locale: Locale, path = ""): string {
  return (locale === defaultLocale ? path : `/${locale}${path}`) || "/";
}

/** A public pathname without its language prefix: "/id/shop/x" -> "/shop/x", "/en" -> "", "/work" -> "/work". */
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts.splice(1, 1);
  const rest = parts.join("/");
  return rest === "/" ? "" : rest;
}

/** The language of a public pathname: /id/... is Indonesian, anything else English. */
export function localeOf(pathname: string): Locale {
  const first = pathname.split("/")[1] ?? "";
  return isLocale(first) ? first : defaultLocale;
}

export function href(locale: Locale, page: PageKey): string {
  return localePath(locale, PATHS[page]);
}

export function projectHref(locale: Locale, slug: string): string {
  return localePath(locale, `/work/${slug}`);
}

export function productHref(locale: Locale, slug: string): string {
  return localePath(locale, `/shop/${slug}`);
}

/** Same path in the other language: /id/shop/x -> /shop/x (English has no prefix) */
export function switchLocalePath(pathname: string, to: Locale): string {
  return localePath(to, stripLocale(pathname));
}

/** A string in both languages. */
export type L10n = Record<Locale, string>;
export const t = (v: L10n, locale: Locale) => v[locale];
