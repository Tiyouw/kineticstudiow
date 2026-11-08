import { revalidateTag } from "next/cache";
import { after, type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { pingIndexNow } from "@/lib/indexnow";
import sitemap from "@/app/sitemap";
import { publishPending } from "@/lib/threads";
import { syncPromos } from "@/lib/promo";

// leaves time for Threads to process images after a Journal post is published
export const maxDuration = 300;

type Body = { _type?: string; slug?: { current?: string } };

/** Called by the Sanity webhook on every publish: the site shows the change within seconds, and Bing hears of it via IndexNow. */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  const { isValidSignature, body } = await parseBody<Body>(req, secret, true);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  revalidateTag("sanity");

  after(async () => {
    const slug = body?.slug?.current;
    // a product or a Journal post: its page and the lists that show it; anything else may show on any page
    const urls =
      body?._type === "product" && slug
        ? locales.flatMap((l) => [`${SITE_URL}/${l}/shop/${slug}`, `${SITE_URL}/${l}/shop`, `${SITE_URL}/${l}`])
        : body?._type === "post" && slug
          ? locales.flatMap((l) => [`${SITE_URL}/${l}/journal/${slug}`, `${SITE_URL}/${l}/journal`])
          : (await sitemap()).map((e) => e.url);
    await pingIndexNow(urls);
    // Journal entries ticked "Kirim ke Threads" go out once published; the daily cron retries any that fail.
    // Run on every webhook, not only post ones: the payload may not carry _type.
    // a new premade mascot gets a ready-to-schedule Threads promo; a sold one loses its unsent promo
    await syncPromos().catch((e) => console.error("promo", e));
    await publishPending().catch((e) => console.error("Threads", e));
  });

  return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
}
