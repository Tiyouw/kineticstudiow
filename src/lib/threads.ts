/**
 * Threads API (server only): connect one or more Threads accounts, keep their tokens alive, and post Journal entries
 * to the accounts ticked on them. Endpoints per developers.facebook.com/documentation/threads (graph.threads.com, v1.0).
 * Tokens live in private Sanity documents (dotted ids, not publicly readable); they are never sent to a browser.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SITE_URL } from "./site";
import { imageUrl, threadsText, trimTo } from "@/sanity/share";

const GRAPH = "https://graph.threads.com";
const API = `${GRAPH}/v1.0`;
export const SCOPES = ["threads_basic", "threads_content_publish", "threads_share_to_instagram", "threads_manage_insights", "threads_delete", "threads_read_replies"];
export const CALLBACK = `${SITE_URL}/api/threads/callback`;
const DAY = 86_400_000;

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });

export type ThreadsAuth = { token?: string | null; userId?: string; username?: string; expiresAt?: string; updatedAt?: string; lastError?: string | null };

export const appId = () => process.env.THREADS_APP_ID ?? "";
const appSecret = () => process.env.THREADS_APP_SECRET ?? "";
export const isConfigured = () => !!(appId() && appSecret() && process.env.SANITY_API_WRITE_TOKEN);

/* ---------- OAuth state: a timestamp signed with the revalidate secret, valid 15 minutes ---------- */

const sign = (s: string) => createHmac("sha256", process.env.SANITY_REVALIDATE_SECRET ?? "").update(s).digest("base64url");

export function makeState() {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

export function checkState(state: string | null) {
  const [ts, sig] = (state ?? "").split(".");
  if (!ts || !sig || !process.env.SANITY_REVALIDATE_SECRET) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(ts));
  return a.length === b.length && timingSafeEqual(a, b) && Date.now() - Number(ts) < 15 * 60_000;
}

export function authorizeUrl() {
  const q = new URLSearchParams({ client_id: appId(), redirect_uri: CALLBACK, scope: SCOPES.join(","), response_type: "code", state: makeState() });
  return `https://threads.com/oauth/authorize?${q}`;
}

/* ---------- token store: one private doc per connected account, secrets.threads.<threads user id> ---------- */

const PREFIX = "secrets.threads.";
export const accountDocId = (userId: string) => `${PREFIX}${userId}`;

export type Account = ThreadsAuth & { userId: string };

export async function getAccounts(): Promise<Account[]> {
  return db.fetch<Account[]>(`*[_type == "threadsAuth" && _id in path("secrets.threads.*")] | order(username asc){token, userId, username, expiresAt, updatedAt, lastError}`);
}

async function saveAuth(userId: string, fields: ThreadsAuth) {
  await db.createIfNotExists({ _id: accountDocId(userId), _type: "threadsAuth", userId });
  await db.patch(accountDocId(userId)).set({ ...fields, updatedAt: new Date().toISOString() }).commit();
}

export const noteError = (userId: string, msg: string) => saveAuth(userId, { lastError: msg }).catch(() => {});

/** Meta's deauthorize / data-deletion callbacks, or "Putuskan" in the Studio: drop that account entirely. */
export const forget = async (userId?: string) => {
  if (userId) await db.delete(accountDocId(userId)).catch(() => {});
};

/* ---------- HTTP ---------- */

async function call<T>(method: "GET" | "POST" | "DELETE", url: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params);
  const res = await fetch(method === "POST" ? url : `${url}?${body}`, {
    method,
    cache: "no-store",
    ...(method === "POST" ? { body, headers: { "Content-Type": "application/x-www-form-urlencoded" } } : {}),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string }; error_message?: string };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? json.error_message ?? `Threads ${res.status}`);
  return json;
}

/* ---------- connect: code -> short-lived -> long-lived (60 days) -> profile ---------- */

export async function connect(code: string) {
  const short = await call<{ access_token: string; user_id: number | string }>("POST", `${GRAPH}/oauth/access_token`, {
    client_id: appId(), client_secret: appSecret(), code: code.replace(/#_$/, ""), grant_type: "authorization_code", redirect_uri: CALLBACK,
  });
  const long = await call<{ access_token: string; expires_in: number }>("GET", `${GRAPH}/access_token`, {
    grant_type: "th_exchange_token", client_secret: appSecret(), access_token: short.access_token,
  });
  const me = await call<{ id: string; username: string }>("GET", `${API}/me`, { fields: "id,username", access_token: long.access_token });
  // a new account gets its own entry; reconnecting the same account just refreshes it
  await saveAuth(me.id, { token: long.access_token, userId: me.id, username: me.username, expiresAt: new Date(Date.now() + long.expires_in * 1000).toISOString(), lastError: null });
  return me.username;
}

/** Long-lived tokens can be refreshed once they are a day old; refresh each account when under 20 days remain. */
export async function refreshAll() {
  const out: Record<string, string> = {};
  for (const a of await getAccounts()) {
    const name = a.username ?? a.userId;
    if (!a.token || !a.expiresAt) { out[name] = "no token"; continue; }
    const left = new Date(a.expiresAt).getTime() - Date.now();
    if (left > 20 * DAY) { out[name] = "fresh"; continue; }
    if (left <= 0) { await noteError(a.userId, "Akses Threads sudah kedaluwarsa. Sambungkan ulang."); out[name] = "expired"; continue; }
    try {
      const r = await call<{ access_token: string; expires_in: number }>("GET", `${GRAPH}/refresh_access_token`, { grant_type: "th_refresh_token", access_token: a.token });
      await saveAuth(a.userId, { token: r.access_token, expiresAt: new Date(Date.now() + r.expires_in * 1000).toISOString(), lastError: null });
      out[name] = "refreshed";
    } catch (e) {
      await noteError(a.userId, `Gagal memperpanjang akses: ${e instanceof Error ? e.message : e}`);
      out[name] = "error";
    }
  }
  return out;
}

/* ---------- publishing ---------- */

/** One account's result for one Journal post, kept in post.social.threads. `removedAt`: taken down from the Studio. */
export type ThreadsShare = { _key: string; account: string; username?: string; id?: string; url?: string; sharedAt?: string; error?: string; igStoryStatus?: string; removedAt?: string };

type PendingPost = {
  _id: string; _rev: string; slug?: string; kind?: string; link?: string; promoSold?: boolean; title?: { en?: string }; caption?: string; publishedAt?: string; shareIgStory?: boolean;
  cover?: string; gallery?: string[]; threadsAccounts?: string[]; social?: { threadsLock?: string; threads?: ThreadsShare[] };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Containers need processing time before they can be published (Meta suggests ~30 s on average). */
async function waitReady(id: string, token: string) {
  for (let i = 0; i < 18; i++) {
    const s = await call<{ status?: string; error_message?: string }>("GET", `${API}/${id}`, { fields: "status,error_message", access_token: token });
    if (s.status === "FINISHED" || s.status === "PUBLISHED") return;
    if (s.status === "ERROR" || s.status === "EXPIRED") throw new Error(`Threads menolak media (${s.error_message ?? s.status})`);
    await sleep(5000);
  }
  throw new Error("Threads terlalu lama memproses media. Akan dicoba lagi besok.");
}

async function postOne(p: PendingPost, a: { token: string; userId: string }) {
  // a Journal article links to its page; a Threads-only post to its optional link
  const url = p.kind === "short" ? p.link?.trim() : `${SITE_URL}/en/journal/${p.slug}`;
  const caption = p.caption?.trim() || p.title?.en || "";
  const text = url ? threadsText(caption, url) : trimTo(caption, 500);
  const images = [p.cover, ...(p.gallery ?? [])].map((ref) => imageUrl(ref, projectId, dataset, 1440)).filter((u): u is string => !!u).slice(0, 10);
  const base = `${API}/${a.userId}/threads`;
  // also as a Story on the Instagram account linked to Threads (Meta: crossreshare_to_ig; the Threads post goes out even if this fails)
  const ig: Record<string, string> = p.shareIgStory ? { crossreshare_to_ig: "true" } : {};

  let creation: string;
  if (images.length >= 2) {
    const children: string[] = [];
    for (const image_url of images) {
      const c = await call<{ id: string }>("POST", base, { media_type: "IMAGE", image_url, is_carousel_item: "true", access_token: a.token });
      children.push(c.id);
    }
    for (const c of children) await waitReady(c, a.token);
    creation = (await call<{ id: string }>("POST", base, { media_type: "CAROUSEL", children: children.join(","), text, ...ig, access_token: a.token })).id;
  } else if (images.length === 1) {
    creation = (await call<{ id: string }>("POST", base, { media_type: "IMAGE", image_url: images[0], text, ...ig, access_token: a.token })).id;
  } else {
    creation = (await call<{ id: string }>("POST", base, { media_type: "TEXT", text, ...ig, access_token: a.token })).id;
  }
  await waitReady(creation, a.token);
  const pub = await call<{ id: string; crossreshare_to_ig_status?: string }>("POST", `${API}/${a.userId}/threads_publish`, { creation_id: creation, access_token: a.token });
  const media = await call<{ permalink?: string }>("GET", `${API}/${pub.id}`, { fields: "permalink", access_token: a.token }).catch(() => ({ permalink: undefined }));
  return { id: pub.id, url: media.permalink, ig: pub.crossreshare_to_ig_status };
}

/**
 * Posts every published Journal entry to each Threads account ticked on it that it hasn't reached yet. Safe to call
 * often: a revision-checked lock per post stops two runs (webhook + cron) posting the same entry twice, and results
 * are kept per account, so the daily cron retries only the accounts that failed.
 */
export async function publishPending() {
  if (!isConfigured()) return { skipped: "not configured" };
  const accounts = new Map((await getAccounts()).filter((a) => a.token).map((a) => [a.userId, a]));
  if (!accounts.size) return { skipped: "no accounts" };
  const posts = await db.fetch<PendingPost[]>(
    `*[_type == "post" && count(threadsAccounts) > 0 && !(_id in path("drafts.**")) && (defined(slug.current) || kind == "short") && publishedAt <= now()]{
      _id, _rev, "slug": slug.current, kind, link, "promoSold": promoFor->sold, title, caption, publishedAt, shareIgStory, threadsAccounts, "cover": cover.asset._ref, "gallery": gallery[].asset._ref, social
    }`,
  );
  let posted = 0, failed = 0;
  for (const p of posts) {
    if (p.promoSold) continue; // a promo for a mascot that sold in the meantime: don't send it
    const reached = new Set((p.social?.threads ?? []).filter((t) => t.id).map((t) => t.account));
    const todo = (p.threadsAccounts ?? []).filter((id) => !reached.has(id) && accounts.has(id));
    if (!todo.length) continue;
    if (p.social?.threadsLock && Date.now() - new Date(p.social.threadsLock).getTime() < 5 * 60_000) continue;
    try {
      await db.patch(p._id).ifRevisionId(p._rev).setIfMissing({ social: {} }).set({ "social.threadsLock": new Date().toISOString() }).commit();
    } catch {
      continue; // someone else changed or locked it first
    }
    const list = [...(p.social?.threads ?? [])];
    for (const id of todo) {
      const acc = accounts.get(id)!;
      const entry: ThreadsShare = { _key: id, account: id, username: acc.username };
      try {
        const r = await postOne(p, { token: acc.token!, userId: id });
        Object.assign(entry, { id: r.id, sharedAt: new Date().toISOString(), ...(r.url ? { url: r.url } : {}), ...(r.ig ? { igStoryStatus: r.ig } : {}) });
        posted++;
      } catch (e) {
        entry.error = e instanceof Error ? e.message : String(e);
        await noteError(id, entry.error);
        failed++;
      }
      const at = list.findIndex((t) => t.account === id);
      if (at >= 0) list[at] = entry;
      else list.push(entry);
    }
    await db.patch(p._id).set({ "social.threads": list }).unset(["social.threadsLock"]).commit().catch(() => {});
  }
  return { posted, failed };
}

/* ---------- taking a post down, or sending it again (a typo: Threads posts can't be edited) ---------- */

/** Threads' answer for media that was deleted (in the app, or never existed). */
const isGone = (e: unknown) => /does not exist|Unsupported get request|Unsupported delete request/i.test(e instanceof Error ? e.message : String(e));

async function deleteOnThreads(mediaId: string, token: string) {
  try {
    await call("DELETE", `${API}/${mediaId}`, { access_token: token });
  } catch (e) {
    if (!isGone(e)) throw e; // already deleted in the Threads app: nothing to do
  }
}

type ShareRef = { postId: string; account: string };

async function shareOf({ postId, account }: ShareRef) {
  const r = await db.fetch<{ share?: ThreadsShare } | null>(`*[_id == $postId && _type == "post"][0]{ "share": social.threads[_key == $account][0] }`, { postId, account });
  const token = (await getAccounts()).find((a) => a.userId === account)?.token;
  return { share: r?.share, token };
}

/** Deletes the post from that Threads account (its Instagram Story goes with it) and marks it so it isn't sent again. */
export async function takeDown(ref: ShareRef) {
  const { share, token } = await shareOf(ref);
  if (!share?.id) throw new Error("Belum ada post di akun ini.");
  if (!token) throw new Error("Akun ini sudah tidak tersambung. Hapus post-nya langsung di Threads.");
  await deleteOnThreads(share.id, token);
  await db.patch(ref.postId).set({ [`social.threads[_key == "${ref.account}"].removedAt`]: new Date().toISOString() }).commit();
}

/** Deletes the old post (if still up), then sends the published version of the Journal entry again. */
export async function resend(ref: ShareRef) {
  const { share, token } = await shareOf(ref);
  if (!token) throw new Error("Akun ini sudah tidak tersambung. Sambungkan lagi di menu Threads.");
  if (share?.id && !share.removedAt) await deleteOnThreads(share.id, token);
  await db.patch(ref.postId).unset([`social.threads[_key == "${ref.account}"]`]).commit();
  return publishPending();
}

/* ---------- insights for posts already on Threads ---------- */

const METRICS = ["views", "likes", "replies", "reposts", "quotes"];

/** Numbers per media id; `{ gone: 1 }` for a post deleted in the Threads app. */
export async function insights(ids: string[]) {
  if (!ids.length) return {};
  // only media this site posted, each read with the token of the account that posted it
  const rows = await db.fetch<{ s: { id: string; account: string }[] }[]>(`*[_type == "post" && count(social.threads[id in $ids]) > 0]{ "s": social.threads[id in $ids]{id, account} }`, { ids });
  const shares = rows.flatMap((r) => r.s ?? []);
  const tokens = new Map((await getAccounts()).map((a) => [a.userId, a.token]));
  const out: Record<string, Record<string, number>> = {};
  for (const { id, account } of shares) {
    const token = tokens.get(account);
    if (!token) continue;
    try {
      const r = await call<{ data: { name: string; values?: { value: number }[] }[] }>("GET", `${API}/${id}/insights`, { metric: METRICS.join(","), access_token: token });
      out[id] = Object.fromEntries(r.data.map((m) => [m.name, m.values?.[0]?.value ?? 0]));
    } catch (e) {
      // deleted in the Threads app? (otherwise insights just aren't ready yet)
      if (isGone(e)) out[id] = { gone: 1 };
      else await call("GET", `${API}/${id}`, { fields: "id", access_token: token }).catch((e2) => { if (isGone(e2)) out[id] = { gone: 1 }; });
    }
  }
  return out;
}

/* ---------- Meta's signed_request (deauthorize / data deletion callbacks) ---------- */

export function parseSignedRequest(sr: string | null): { user_id?: string | number } | null {
  const [sig, payload] = (sr ?? "").split(".");
  if (!sig || !payload || !appSecret()) return null;
  const expected = createHmac("sha256", appSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/* ---------- account statistics for the Studio's Statistik tool ---------- */

type InsightRow = { name: string; values?: { value: number }[]; total_value?: { value: number } };
const total = (m?: InsightRow) => m?.total_value?.value ?? (m?.values ?? []).reduce((s, v) => s + (v.value ?? 0), 0);

/** Per connected account, the last `days` days: views, likes, replies, reposts, quotes, followers and best posts. */
export async function accountStats(days: number) {
  const until = Math.floor(Date.now() / 1000);
  const since = Math.max(until - days * 86_400, 1712991600); // Threads keeps account insights from 13 April 2024
  const out = [];
  for (const a of await getAccounts()) {
    if (!a.token) continue;
    const row: { username?: string; followers?: number; views: number; likes: number; replies: number; reposts: number; quotes: number; error?: string; topPosts: { url?: string; text: string; views: number; likes: number; at?: string }[] } =
      { username: a.username, views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0, topPosts: [] };
    try {
      const r = await call<{ data: InsightRow[] }>("GET", `${API}/${a.userId}/threads_insights`, { metric: "views,likes,replies,reposts,quotes", since: String(since), until: String(until), access_token: a.token });
      const by = new Map(r.data.map((m) => [m.name, m]));
      Object.assign(row, { views: total(by.get("views")), likes: total(by.get("likes")), replies: total(by.get("replies")), reposts: total(by.get("reposts")), quotes: total(by.get("quotes")) });
      const f = await call<{ data: InsightRow[] }>("GET", `${API}/${a.userId}/threads_insights`, { metric: "followers_count", access_token: a.token }).catch(() => null);
      row.followers = f ? total(f.data[0]) : undefined;
      const posts = await call<{ data: { id: string; text?: string; permalink?: string; timestamp?: string }[] }>("GET", `${API}/${a.userId}/threads`, { fields: "id,text,permalink,timestamp", since: String(since), limit: "15", access_token: a.token });
      const scored = [];
      for (const p of posts.data) {
        const ins = await call<{ data: InsightRow[] }>("GET", `${API}/${p.id}/insights`, { metric: "views,likes", access_token: a.token }).catch(() => null);
        const m = new Map((ins?.data ?? []).map((x) => [x.name, x]));
        scored.push({ url: p.permalink, text: (p.text ?? "").slice(0, 120), views: total(m.get("views")), likes: total(m.get("likes")), at: p.timestamp });
      }
      row.topPosts = scored.sort((x, y) => y.views - x.views).slice(0, 5);
    } catch (e) {
      row.error = e instanceof Error ? e.message : String(e);
    }
    out.push(row);
  }
  return out;
}
