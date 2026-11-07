/**
 * One-time: put the current placeholder content into Sanity.
 * Run: set -a; . ./.env.local; set +a; npx tsx scripts/seed-sanity.ts
 * Uses createIfNotExists, so running it again never overwrites edits made in the Studio.
 */
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { clientMarks, products, projects, testimonials } from "../src/content/data";
import { DICTS, type CopyKey } from "../src/i18n/dicts";
import { toCms } from "../src/sanity/copy";
import { DEFAULT_WA } from "../src/lib/whatsapp";

const client = createClient({
  projectId: process.env.SANITY_API_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_API_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2025-01-01",
  useCdn: false,
});

const uploaded = new Map<string, string>();
async function image(src: string) {
  if (!uploaded.has(src)) {
    const buf = await readFile(join(process.cwd(), "public", src));
    const a = await client.assets.upload("image", buf, { filename: basename(src) });
    uploaded.set(src, a._id);
    console.log("uploaded", src);
  }
  return { _type: "image", asset: { _type: "reference", _ref: uploaded.get(src)! } };
}
let k = 0;
const key = () => `s${(k++).toString(36)}`;
const gallery = async (list: string[]) => Promise.all(list.map(async (g) => ({ _key: key(), ...(await image(g)) })));

async function main() {
  const tx = client.transaction();
  for (const p of products) {
    tx.createIfNotExists({
      _id: `product-${p.slug}`, _type: "product", no: p.no, name: p.name, slug: { _type: "slug", current: p.slug },
      sold: p.sold, priceIdr: p.priceIdr, priceUsd: p.priceUsd, ...(p.wasIdr ? { wasIdr: p.wasIdr } : {}),
      image: await image(p.image), gallery: await gallery(p.gallery), tone: p.tone, isPlaceholder: p.isPlaceholder,
    });
  }
  for (const p of projects) {
    tx.createIfNotExists({
      _id: `project-${p.id}`, _type: "project", id: p.id, title: p.title, category: p.category, year: p.year, client: p.client,
      services: p.services, description: p.description, image: await image(p.image), gallery: await gallery(p.gallery), tone: p.tone, real: p.real,
    });
  }
  testimonials.forEach((t, i) => tx.createIfNotExists({ _id: `testimonial-${i + 1}`, _type: "testimonial", quote: t.quote, who: t.who, order: i + 1, isPlaceholder: t.isPlaceholder }));
  clientMarks.forEach((m, i) => tx.createIfNotExists({ _id: `clientMark-${i + 1}`, _type: "clientMark", name: m.name, variant: m.variant, order: i + 1 }));
  tx.createIfNotExists({ _id: "settings", _type: "settings", waNumber: DEFAULT_WA.number, templates: DEFAULT_WA.templates });
  for (const name of Object.keys(DICTS) as CopyKey[]) {
    const d = DICTS[name];
    tx.createIfNotExists({ _id: `copy_${name}`, _type: `copy_${name}`, ...(toCms(d.en as never, d.id as never) as object) });
  }
  const res = await tx.commit();
  console.log("done:", res.results.length, "documents");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
