import { type NextRequest, NextResponse } from "next/server";
import { KINDS, countClick, type Kind } from "@/lib/stats";

export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|curl|wget|python|node-fetch/i;
// best effort: the same visitor clicking the same kind again within 10 s counts once
const recent = new Map<string, number>();

/** Beacon from the site (components/TrackClicks): one WhatsApp or email click. Always answers 204. */
export async function POST(req: NextRequest) {
  const none = new NextResponse(null, { status: 204 });
  if (BOT.test(req.headers.get("user-agent") ?? "")) return none;
  const body = (await req.json().catch(() => null)) as { kind?: string; slug?: string; locale?: string } | null;
  const kind = body?.kind as Kind | undefined;
  if (!kind || !KINDS.includes(kind)) return none;
  const slug = typeof body?.slug === "string" && /^[a-z0-9-]{1,80}$/.test(body.slug) ? body.slug : undefined;

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  const k = `${ip}|${kind}|${slug ?? ""}`;
  const now = Date.now();
  if ((recent.get(k) ?? 0) > now - 10_000) return none;
  recent.set(k, now);
  if (recent.size > 5000) for (const [x, t] of recent) if (t < now - 10_000) recent.delete(x);

  await countClick(kind, slug, body?.locale).catch((e) => console.error("track", e));
  return none;
}
