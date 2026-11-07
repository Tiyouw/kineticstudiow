import { type NextRequest, NextResponse } from "next/server";
import { noteError, publishPending, refreshIfNeeded } from "@/lib/threads";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Daily (vercel.json): keep the 60-day token alive and retry Journal posts that didn't go out. */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = await refreshIfNeeded().catch(async (e) => {
    await noteError(`Gagal memperpanjang akses: ${e instanceof Error ? e.message : e}`);
    return "error";
  });
  const posts = await publishPending().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
  return NextResponse.json({ token, posts });
}
