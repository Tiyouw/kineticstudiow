import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { getPosts, getProducts, getProjects } from "@/content";

const PAGES = ["", "/work", "/shop", "/custom-order", "/about", "/faq", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, projects, posts] = await Promise.all([getProducts(), getProjects(), getPosts()]);
  // placeholder projects are noindex, so they stay out until the real work is in; the Journal joins with its first post
  const paths = [
    ...PAGES,
    ...products.map((p) => `/shop/${p.slug}`),
    ...projects.filter((p) => p.real).map((p) => `/work/${p.slug}`),
    ...(posts.length ? ["/journal", ...posts.map((p) => `/journal/${p.slug}`)] : []),
  ];
  return paths.flatMap((path) =>
    locales.map((l) => ({
      url: `${SITE_URL}/${l}${path}`,
      changeFrequency: path.startsWith("/shop") || path === "/journal" ? ("weekly" as const) : path === "/privacy" ? ("yearly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/privacy" ? 0.2 : path.split("/").length > 2 ? 0.6 : 0.8,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}${path}`])) },
    })),
  );
}
