import { revalidateTag } from "next/cache";
import { after, type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { pingIndexNow } from "@/lib/indexnow";
import sitemap from "@/app/sitemap";

type Body = { _type?: string; slug?: { current?: string } };

/** Called by the Sanity webhook on every publish: the site shows the change within seconds, and Bing hears of it via IndexNow. */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  const { isValidSignature, body } = await parseBody<Body>(req, secret, true);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  revalidateTag("sanity");

  after(async () => {
    const slug = body?._type === "product" ? body.slug?.current : undefined;
    // a product: its page and the lists that show it; anything else may show on any page
    const urls = slug
      ? locales.flatMap((l) => [`${SITE_URL}/${l}/shop/${slug}`, `${SITE_URL}/${l}/shop`, `${SITE_URL}/${l}`])
      : (await sitemap()).map((e) => e.url);
    await pingIndexNow(urls);
  });

  return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
}
