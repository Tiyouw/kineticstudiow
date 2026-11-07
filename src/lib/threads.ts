/**
 * Threads API (server only): connect Kinetic's account, keep its token alive, and post Journal entries marked
 * "Kirim ke Threads". Endpoints per developers.facebook.com/documentation/threads (graph.threads.com, v1.0).
 * The token lives in a private Sanity document (dotted id, not publicly readable); it is never sent to a browser.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SITE_URL } from "./site";
import { imageUrl, threadsText } from "@/sanity/share";

const GRAPH = "https://graph.threads.com";
const API = `${GRAPH}/v1.0`;
export const SCOPES = ["threads_basic", "threads_content_publish", "threads_share_to_instagram", "threads_manage_insights", "threads_delete", "threads_read_replies"];
export const CALLBACK = `${SITE_URL}/api/threads/callback`;
const AUTH_ID = "secrets.threads";
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

/* ---------- token store ---------- */

export async function getAuth(): Promise<ThreadsAuth | null> {
  return db.fetch<ThreadsAuth | null>(`*[_id == $id][0]{token, userId, username, expiresAt, updatedAt, lastError}`, { id: AUTH_ID });
}

async function saveAuth(fields: ThreadsAuth) {
  await db.createIfNotExists({ _id: AUTH_ID, _type: "threadsAuth" });
  await db.patch(AUTH_ID).set({ ...fields, updatedAt: new Date().toISOString() }).commit();
}

export const noteError = (msg: string) => saveAuth({ lastError: msg }).catch(() => {});
export const forget = () => saveAuth({ token: null, lastError: "Akses dicabut dari Threads. Sambungkan ulang." });

/* ---------- HTTP ---------- */

async function call<T>(method: "GET" | "POST", url: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params);
  const res = await fetch(method === "GET" ? `${url}?${body}` : url, {
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
  await saveAuth({ token: long.access_token, userId: me.id, username: me.username, expiresAt: new Date(Date.now() + long.expires_in * 1000).toISOString(), lastError: null });
  return me.username;
}

/** Long-lived tokens can be refreshed once they are a day old; refresh when under 20 days remain. */
export async function refreshIfNeeded() {
  const a = await getAuth();
  if (!a?.token || !a.expiresAt) return "not connected";
  const left = new Date(a.expiresAt).getTime() - Date.now();
  if (left > 20 * DAY) return "fresh";
  if (left <= 0) { await noteError("Akses Threads sudah kedaluwarsa. Sambungkan ulang."); return "expired"; }
  const r = await call<{ access_token: string; expires_in: number }>("GET", `${GRAPH}/refresh_access_token`, { grant_type: "th_refresh_token", access_token: a.token });
  await saveAuth({ token: r.access_token, expiresAt: new Date(Date.now() + r.expires_in * 1000).toISOString(), lastError: null });
  return "refreshed";
}

/* ---------- publishing ---------- */

type PendingPost = {
  _id: string; _rev: string; slug?: string; title?: { en?: string }; caption?: string; publishedAt?: string; shareIgStory?: boolean;
  cover?: string; gallery?: string[]; social?: { threadsLock?: string };
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
  const url = `${SITE_URL}/en/journal/${p.slug}`;
  const text = threadsText(p.caption?.trim() || p.title?.en || "", url);
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
 * Posts every published Journal entry ticked "Kirim ke Threads" that hasn't gone out yet. Safe to call often:
 * a revision-checked lock stops two runs (webhook + cron) posting the same entry twice.
 */
export async function publishPending() {
  if (!isConfigured()) return { skipped: "not configured" };
  const a = await getAuth();
  if (!a?.token || !a.userId) return { skipped: "not connected" };
  const posts = await db.fetch<PendingPost[]>(
    `*[_type == "post" && shareThreads == true && !defined(social.threadsId) && !(_id in path("drafts.**")) && defined(slug.current) && publishedAt <= now()]{
      _id, _rev, "slug": slug.current, title, caption, publishedAt, shareIgStory, "cover": cover.asset._ref, "gallery": gallery[].asset._ref, social
    }`,
  );
  const done: string[] = [];
  for (const p of posts) {
    if (p.social?.threadsLock && Date.now() - new Date(p.social.threadsLock).getTime() < 5 * 60_000) continue;
    try {
      await db.patch(p._id).ifRevisionId(p._rev).setIfMissing({ social: {} }).set({ "social.threadsLock": new Date().toISOString() }).commit();
    } catch {
      continue; // someone else changed or locked it first
    }
    try {
      const r = await postOne(p, { token: a.token, userId: a.userId });
      await db.patch(p._id)
        .set({ "social.threadsId": r.id, "social.sharedAt": new Date().toISOString(), ...(r.url ? { "social.threadsUrl": r.url } : {}), ...(r.ig ? { "social.igStoryStatus": r.ig } : {}) })
        .unset(["social.threadsLock", "social.threadsError"])
        .commit();
      done.push(p._id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await db.patch(p._id).set({ "social.threadsError": msg }).unset(["social.threadsLock"]).commit().catch(() => {});
      await noteError(msg);
    }
  }
  return { posted: done.length, pending: posts.length - done.length };
}

/* ---------- insights for posts already on Threads ---------- */

const METRICS = ["views", "likes", "replies", "reposts", "quotes"];

export async function insights(ids: string[]) {
  const a = await getAuth();
  if (!a?.token || !ids.length) return {};
  const known = await db.fetch<string[]>(`*[_type == "post" && social.threadsId in $ids].social.threadsId`, { ids });
  const out: Record<string, Record<string, number>> = {};
  for (const id of known) {
    try {
      const r = await call<{ data: { name: string; values?: { value: number }[] }[] }>("GET", `${API}/${id}/insights`, { metric: METRICS.join(","), access_token: a.token });
      out[id] = Object.fromEntries(r.data.map((m) => [m.name, m.values?.[0]?.value ?? 0]));
    } catch {
      /* a post deleted on Threads, or insights not ready yet */
    }
  }
  return out;
}

/* ---------- Meta's signed_request (deauthorize / data deletion callbacks) ---------- */

export function parseSignedRequest(sr: string | null): { user_id?: string } | null {
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
