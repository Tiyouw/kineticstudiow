/** Agenda data: Journal posts merged from their draft/published copies, the board stages, slots and the queue. */
import type { SanityClient } from "sanity";

export type Stage = "idea" | "draft" | "ready" | "scheduled" | "live";
export const STAGES: Stage[] = ["idea", "draft", "ready", "scheduled", "live"];
export const STAGE: Record<Stage, { label: string; color: string; hint: string }> = {
  idea: { label: "Ide", color: "#9b7fd4", hint: "Catatan ide, belum ditulis." },
  draft: { label: "Draf", color: "#8690a0", hint: "Sedang ditulis." },
  ready: { label: "Siap", color: "#3b82c4", hint: "Tinggal dijadwalkan." },
  scheduled: { label: "Terjadwal", color: "#d9a520", hint: "Sudah di-Publish, tampil pada tanggalnya." },
  live: { label: "Terbit", color: "#3aa76d", hint: "Sudah tampil di situs." },
};

export type Doc = {
  _id: string; _type: "post"; _rev?: string; title?: { en?: string; id?: string }; slug?: { current?: string }; publishedAt?: string;
  cover?: { asset?: { _ref?: string } }; threadsAccounts?: string[]; caption?: string; stage?: string; ideaNotes?: string;
  social?: { threads?: { id?: string }[] };
  [k: string]: unknown;
};

export type Item = {
  id: string; title: string; date?: Date; stage: Stage; changed: boolean; cover?: string; notes?: string;
  threads: number; shared: number; hasDraft: boolean; hasPublished: boolean; doc: Doc;
};

export const QUERY = `*[_type == "post"]`;

export function merge(rows: Doc[]): Item[] {
  const by = new Map<string, { draft?: Doc; pub?: Doc }>();
  for (const r of rows) {
    const id = r._id.replace(/^drafts\./, "");
    const e = by.get(id) ?? {};
    if (r._id.startsWith("drafts.")) e.draft = r;
    else e.pub = r;
    by.set(id, e);
  }
  const now = Date.now();
  return [...by.entries()].map(([id, { draft, pub }]) => {
    const r = (draft ?? pub)!;
    const pubAt = pub?.publishedAt ? new Date(pub.publishedAt).getTime() : 0;
    const stage: Stage = pub ? (pubAt > now ? "scheduled" : "live") : r.stage === "idea" ? "idea" : r.stage === "ready" ? "ready" : "draft";
    return {
      id, stage, doc: r, changed: !!(pub && draft), hasDraft: !!draft, hasPublished: !!pub,
      title: r.title?.en?.trim() || "(tanpa judul)",
      date: r.publishedAt && stage !== "idea" ? new Date(r.publishedAt) : undefined,
      cover: r.cover?.asset?._ref, notes: r.ideaNotes,
      threads: r.threadsAccounts?.length ?? 0, shared: (pub?.social?.threads ?? []).filter((t) => t.id).length,
    };
  });
}

/* ---------- dates ---------- */

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export const fmtTime = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
export const fmtDay = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
export const fmtFull = (d: Date) => d.toLocaleString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
/** For <input type="datetime-local">: local time, no seconds. */
export const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = (s: string) => (s ? new Date(s) : undefined);

/* ---------- slots and the queue ---------- */

export type Slot = { _key?: string; day: number; time: string };
export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** The slot times on one day (Date objects), earliest first. */
export function slotsOn(day: Date, slots: Slot[]) {
  return slots
    .filter((s) => s.day === day.getDay())
    .map((s) => { const [h, m] = s.time.split(":").map(Number); return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m); })
    .sort((a, b) => a.getTime() - b.getTime());
}

/** A slot counts as taken when a dated post (not an idea) sits on it, to the minute. */
export const takenAt = (items: Item[]) => new Set(items.filter((i) => i.date && i.stage !== "idea").map((i) => i.date!.getTime()));

/** The next free slot at least 15 minutes from now, within ~4 months. */
export function nextFreeSlot(slots: Slot[], items: Item[], ignoreId?: string) {
  if (!slots.length) return undefined;
  const taken = takenAt(items.filter((i) => i.id !== ignoreId));
  const soon = Date.now() + 15 * 60_000;
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    for (const t of slotsOn(day, slots)) if (t.getTime() >= soon && !taken.has(t.getTime())) return t;
  }
  return undefined;
}

/* ---------- checks and writes ---------- */

/** What a post still needs before it can be published (same rules as the form). */
export function missing(doc: Doc): string[] {
  const m: string[] = [];
  if (!doc.title?.en?.trim()) m.push("Judul (English)");
  if (!doc.cover?.asset?._ref) m.push("Foto sampul");
  return m;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** A slug from the title that no other post uses. */
async function freeSlug(client: SanityClient, title: string, id: string) {
  const base = slugify(title) || "tulisan";
  for (let n = 1; n < 50; n++) {
    const s = n === 1 ? base : `${base}-${n}`;
    const used = await client.fetch<number>(`count(*[_type == "post" && slug.current == $s && !(_id in [$id, $draft])])`, { s, id, draft: `drafts.${id}` });
    if (!used) return s;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Publish (or schedule, when `at` is in the future) straight from the Agenda: the draft becomes the published
 * document with that date, as the Publish button would. Fills a missing slug from the title.
 */
export async function publishAt(client: SanityClient, it: Item, at: Date) {
  const src = it.doc;
  const need = missing(src);
  if (need.length) throw new Error(`Masih kurang: ${need.join(", ")}. Buka tulisannya untuk melengkapi.`);
  const { _rev, _createdAt, _updatedAt, ...rest } = src as Doc & { _createdAt?: string; _updatedAt?: string };
  void _rev; void _createdAt; void _updatedAt;
  const slug = src.slug?.current || (await freeSlug(client, src.title!.en!, it.id));
  const doc = { ...rest, _id: it.id, _type: "post" as const, slug: { _type: "slug", current: slug }, publishedAt: at.toISOString() };
  delete (doc as Record<string, unknown>).stage;
  const tx = client.transaction().createOrReplace(doc);
  if (it.hasDraft) tx.delete(`drafts.${it.id}`);
  await tx.commit();
}

/** Move a not-yet-published post between Ide / Draf / Siap. */
export async function setStage(client: SanityClient, it: Item, stage: "idea" | "draft" | "ready") {
  if (it.hasPublished) throw new Error("Tulisan ini sudah di-Publish. Untuk menariknya dari situs, buka tulisannya lalu Unpublish.");
  await client.patch(`drafts.${it.id}`).set({ stage }).commit();
}

/** Change the date only. A published post moves at once; an open draft moves with it. */
export async function setDate(client: SanityClient, it: Item, at: Date) {
  const tx = client.transaction();
  if (it.hasPublished) tx.patch(it.id, (p) => p.set({ publishedAt: at.toISOString() }));
  if (it.hasDraft) tx.patch(`drafts.${it.id}`, (p) => p.set({ publishedAt: at.toISOString(), ...(it.stage === "idea" ? { stage: "draft" } : {}) }));
  await tx.commit();
}

/** A new draft from the quick-add box. */
export async function createPost(client: SanityClient, f: { title: string; stage: "idea" | "draft" | "ready"; at?: Date; notes?: string; accounts: string[] }) {
  const id = crypto.randomUUID();
  await client.create({
    _id: `drafts.${id}`, _type: "post", stage: f.stage,
    title: { en: f.title.trim() },
    ...(f.at && f.stage !== "idea" ? { publishedAt: f.at.toISOString() } : {}),
    ...(f.notes?.trim() ? { ideaNotes: f.notes.trim() } : {}),
    ...(f.accounts.length ? { threadsAccounts: f.accounts } : {}),
  });
  return id;
}
