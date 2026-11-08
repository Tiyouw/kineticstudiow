/**
 * Promo posts for new premade mascots: when a mascot is published, a "Post Threads saja" draft is made for it
 * (photo, name, price, shop link), marked Siap in the Agenda so Fatwa only has to schedule or queue it.
 * When the mascot sells, its unsent promo draft is removed (a scheduled one is skipped by publishPending).
 */
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SITE_URL } from "./site";

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });

/** Only mascots added from now on get a promo; the existing catalogue doesn't flood the Agenda. */
const SINCE = "2026-11-08T00:00:00Z";
/** Private list of mascots that already got a promo, so deleting a promo doesn't bring it back. */
const DONE = "secrets.promoDone";

type P = { _id: string; no?: string; name?: string; slug?: string; priceUsd?: number; priceIdr?: number; image?: string; sold?: boolean };

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function promoCaption(p: P) {
  const price = p.priceUsd ? usd(p.priceUsd) : p.priceIdr ? `Rp${p.priceIdr.toLocaleString("id-ID")}` : "";
  return [
    `New premade mascot: #${p.no ?? ""} ${p.name ?? ""}`.trim(),
    `One of a kind, sold to one brand only.${price ? ` ${price}.` : ""}`,
    "Make it yours, name and colours adjusted for your brand.",
  ].join("\n");
}

export async function syncPromos() {
  if (!process.env.SANITY_API_WRITE_TOKEN) return { skipped: "no token" };
  const fresh = await db.fetch<P[]>(
    `*[_type == "product" && !(_id in path("drafts.**")) && _createdAt > $since && sold != true && defined(slug.current)
      && !(_id in coalesce(*[_id == $done][0].ids, []))]{ _id, no, name, "slug": slug.current, priceUsd, priceIdr, "image": image.asset._ref }`,
    { since: SINCE, done: DONE },
  );
  const accounts = await db.fetch<string[]>(`*[_type == "threadsAuth" && _id in path("secrets.threads.*") && defined(token)].userId`);
  for (const p of fresh) {
    await db.createIfNotExists({
      _id: `drafts.promo-${p._id}`, _type: "post", kind: "short", stage: "ready",
      title: { en: `Promo #${p.no ?? ""} ${p.name ?? ""}`.trim() },
      caption: promoCaption(p),
      link: `${SITE_URL}/en/shop/${p.slug}`,
      ...(p.image ? { cover: { _type: "image", asset: { _type: "reference", _ref: p.image } } } : {}),
      promoFor: { _type: "reference", _ref: p._id, _weak: true },
      ...(accounts.length ? { threadsAccounts: accounts } : {}),
    });
    await db.createIfNotExists({ _id: DONE, _type: "promoDone", ids: [] });
    await db.patch(DONE).setIfMissing({ ids: [] }).append("ids", [p._id]).commit();
  }
  // sold mascots: drop promo drafts that were never published
  const stale = await db.fetch<string[]>(
    `*[_type == "post" && _id in path("drafts.**") && string::startsWith(_id, "drafts.promo-") && promoFor->sold == true && count(*[_id == "promo-" + ^.promoFor._ref]) == 0]._id`,
  );
  for (const id of stale) await db.delete(id).catch(() => {});
  return { created: fresh.length, removed: stale.length };
}
