import { getCopy, getPosts } from "@/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

/** RSS 2.0 feed of the Journal: /journal/feed.xml (English) or ?lang=id. For feed readers and social automation. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("lang") ?? "";
  const locale: Locale = isLocale(q) ? q : "en";
  const [t, posts] = await Promise.all([getCopy("journal", locale), getPosts()]);
  const self = `${SITE_URL}/journal/feed.xml${locale === "en" ? "" : `?lang=${locale}`}`;
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/${locale}/journal/${p.slug}`;
      const cover = p.cover.startsWith("http") ? p.cover : SITE_URL + p.cover;
      return `    <item>
      <title>${esc(p.title[locale])}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.caption || p.title[locale])}</description>
      <enclosure url="${esc(cover)}" type="image/jpeg" length="0" />
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`Kinetic Studiow · ${t.pageName}`)}</title>
    <link>${SITE_URL}/${locale}/journal</link>
    <description>${esc(t.metaDesc)}</description>
    <language>${locale === "id" ? "id-ID" : "en"}</language>
    <atom:link href="${esc(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=600" } });
}
