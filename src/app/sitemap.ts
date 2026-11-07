import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { getProducts, getProjects } from "@/content";

const PAGES = ["", "/work", "/shop", "/custom-order", "/about"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, projects] = await Promise.all([getProducts(), getProjects()]);
  // placeholder projects are noindex, so they stay out until the real work is in
  const paths = [...PAGES, ...products.map((p) => `/shop/${p.slug}`), ...projects.filter((p) => p.real).map((p) => `/work/${p.slug}`)];
  return paths.flatMap((path) =>
    locales.map((l) => ({
      url: `${SITE_URL}/${l}${path}`,
      changeFrequency: path.startsWith("/shop") ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}${path}`])) },
    })),
  );
}
