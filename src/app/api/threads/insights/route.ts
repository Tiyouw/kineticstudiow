import { type NextRequest, NextResponse } from "next/server";
import { insights, isConfigured } from "@/lib/threads";

export const dynamic = "force-dynamic";

/** Views, likes, replies, reposts and quotes for Journal posts already on Threads (ids checked against Sanity). */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d{5,30}$/.test(s))
    .slice(0, 20);
  const data = isConfigured() ? await insights(ids).catch(() => ({})) : {};
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } });
}
