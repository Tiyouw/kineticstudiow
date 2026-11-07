import { SITE_URL } from "./site";

/**
 * IndexNow: tells Bing (and Yandex, Seznam, Naver) right away which pages changed, instead of waiting for a crawl.
 * The key is public by design; search engines check it against public/<key>.txt.
 */
export const INDEXNOW_KEY = "dff379d15804c373e5dc299c97b4eb6d";

export async function pingIndexNow(urls: string[]) {
  if (!urls.length || process.env.VERCEL_ENV !== "production") return;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  }).catch((e) => { console.error("IndexNow failed", e); return null; });
  if (res && !res.ok) console.error("IndexNow", res.status, await res.text().catch(() => ""));
}
