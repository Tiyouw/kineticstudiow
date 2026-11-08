/**
 * Site statistics (server only): order-intent clicks counted per day in private Sanity docs
 * (secrets.stats.YYYY-MM-DD, dotted ids so not publicly readable), plus visitor numbers from Cloudflare Web
 * Analytics when its token is set. Dates are in WIB (UTC+7), the studio's day.
 */
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });

export const KINDS = ["order", "ask", "custom", "project", "general", "email"] as const;
export type Kind = (typeof KINDS)[number];

const WIB = 7 * 3_600_000;
/** YYYY-MM-DD in WIB. */
export const wibDay = (t = Date.now()) => new Date(t + WIB).toISOString().slice(0, 10);
const docId = (day: string) => `secrets.stats.${day}`;
/** A Sanity attribute name from a slug: letters, digits and underscores only. */
const key = (slug: string) => `p_${slug.replace(/[^a-z0-9]/g, "_")}`;

export async function countClick(kind: Kind, slug?: string, locale?: string) {
  const day = wibDay();
  const id = docId(day);
  const inc: Record<string, number> = { [`clicks.${kind}`]: 1, total: 1 };
  if (locale === "en" || locale === "id") inc[`locales.${locale}`] = 1;
  const products: Record<string, string> = {};
  if (slug) { inc[`products.${key(slug)}`] = 1; products[key(slug)] = slug; }
  await db.createIfNotExists({ _id: id, _type: "statsDay", day });
  await db
    .patch(id)
    .setIfMissing({ clicks: {}, products: {}, locales: {}, slugs: {}, total: 0 })
    .setIfMissing(Object.fromEntries(Object.keys(inc).map((k) => [k, 0])))
    .inc(inc)
    .set(Object.fromEntries(Object.entries(products).map(([k, v]) => [`slugs.${k}`, v])))
    .commit();
}

type DayDoc = { day: string; total?: number; clicks?: Partial<Record<Kind, number>>; products?: Record<string, number>; slugs?: Record<string, string> };

/** The last `days` days (today included), each day present even with no clicks. */
export async function clickStats(days: number) {
  const list = Array.from({ length: days }, (_, i) => wibDay(Date.now() - (days - 1 - i) * 86_400_000));
  const rows = await db.fetch<DayDoc[]>(`*[_type == "statsDay" && _id in $ids]{day, total, clicks, products, slugs}`, { ids: list.map(docId) });
  const by = new Map(rows.map((r) => [r.day, r]));
  const byKind = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>;
  const prod = new Map<string, number>();
  const byDay = list.map((day) => {
    const r = by.get(day);
    for (const k of KINDS) byKind[k] += r?.clicks?.[k] ?? 0;
    for (const [k, n] of Object.entries(r?.products ?? {})) {
      const slug = r?.slugs?.[k] ?? k.replace(/^p_/, "").replace(/_/g, "-");
      prod.set(slug, (prod.get(slug) ?? 0) + n);
    }
    return { day, count: r?.total ?? 0 };
  });
  const names = new Map((await db.fetch<{ slug: string; name: string; no: string }[]>(`*[_type == "product" && !(_id in path("drafts.**"))]{ "slug": slug.current, name, no }`)).map((p) => [p.slug, `#${p.no} ${p.name}`]));
  const topProducts = [...prod.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([slug, count]) => ({ slug, name: names.get(slug) ?? slug, count }));
  return { total: byDay.reduce((s, d) => s + d.count, 0), byKind, byDay, topProducts };
}

/* ---------- visitors: Cloudflare Web Analytics (RUM) ---------- */

type Group = { count: number; sum?: { visits?: number }; dimensions: Record<string, string> };

export async function visitorStats(days: number) {
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN, account = process.env.CLOUDFLARE_ACCOUNT_ID, site = process.env.CF_SITE_TAG;
  if (!token || !account || !site) return { connected: false as const, reason: "belum disambungkan" };
  const from = wibDay(Date.now() - (days - 1) * 86_400_000), to = wibDay();
  const group = (dims: string, limit: number, order = "count_DESC") =>
    `rumPageloadEventsAdaptiveGroups(limit: ${limit}, filter: { date_geq: $from, date_leq: $to, siteTag: $site }, orderBy: [${order}]) { count sum { visits } dimensions { ${dims} } }`;
  const query = `query($account: String!, $site: String!, $from: Date!, $to: Date!) { viewer { accounts(filter: { accountTag: $account }) {
    total: ${group("siteTag", 1)}
    daily: ${group("date", 100, "date_ASC")}
    pages: ${group("requestPath", 10)}
    countries: ${group("countryName", 10)}
    sources: ${group("refererHost", 10)}
    devices: ${group("deviceType", 5)}
  } } }`;
  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { account, site, from, to } }),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: { viewer?: { accounts?: Record<string, Group[]>[] } }; errors?: { message: string }[] | null };
  if (!res.ok || json.errors?.length) return { connected: false as const, reason: json.errors?.[0]?.message ?? `Cloudflare ${res.status}` };
  const a = json.data?.viewer?.accounts?.[0] ?? {};
  const rows = (k: string, dim: string) => (a[k] ?? []).map((g) => ({ label: g.dimensions[dim] || "(langsung)", views: g.count, visits: g.sum?.visits ?? 0 }));
  const daily = new Map((a.daily ?? []).map((g) => [g.dimensions.date, { views: g.count, visits: g.sum?.visits ?? 0 }]));
  const list = Array.from({ length: days }, (_, i) => wibDay(Date.now() - (days - 1 - i) * 86_400_000));
  return {
    connected: true as const,
    views: a.total?.[0]?.count ?? 0,
    visits: a.total?.[0]?.sum?.visits ?? 0,
    byDay: list.map((day) => ({ day, views: daily.get(day)?.views ?? 0, visits: daily.get(day)?.visits ?? 0 })),
    pages: rows("pages", "requestPath"),
    countries: rows("countries", "countryName"),
    sources: rows("sources", "refererHost"),
    devices: rows("devices", "deviceType"),
  };
}
