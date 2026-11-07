import { type NextRequest, NextResponse } from "next/server";
import { publishPending, refreshAll } from "@/lib/threads";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Daily (vercel.json): keep every account's 60-day token alive and retry Journal posts that didn't go out. */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const tokens = await refreshAll().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
  const posts = await publishPending().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
  return NextResponse.json({ tokens, posts });
}
