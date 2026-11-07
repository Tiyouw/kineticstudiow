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

export function href(locale: Locale, page: PageKey): string {
  return `/${locale}${PATHS[page]}`;
}

export function projectHref(locale: Locale, slug: string): string {
  return `/${locale}/work/${slug}`;
}

export function productHref(locale: Locale, slug: string): string {
  return `/${locale}/shop/${slug}`;
}

/** Same path in the other language: /id/shop/x -> /en/shop/x */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

/** A string in both languages. */
export type L10n = Record<Locale, string>;
export const t = (v: L10n, locale: Locale) => v[locale];
