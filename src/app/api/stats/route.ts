import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { clickStats, visitorStats } from "@/lib/stats";
import { accountStats, isConfigured } from "@/lib/threads";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });
const cache = new Map<number, { at: number; data: unknown }>();

/**
 * Numbers for the Studio's Statistik tool. Same proof of membership as /api/threads/action: the Studio first writes
 * a short-lived `statsRequest` doc with the editor's own session, then calls this with its id.
 */
export async function GET(req: NextRequest) {
  const request = req.nextUrl.searchParams.get("request") ?? "";
  if (!/^statsRequest-[a-zA-Z0-9-]{8,64}$/.test(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const r = await db.fetch<{ _createdAt: string } | null>(`*[_id == $id && _type == "statsRequest"][0]{_createdAt}`, { id: request });
  await db.delete(request).catch(() => {});
  if (!r || Date.now() - new Date(r._createdAt).getTime() > 5 * 60_000) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const d = Number(req.nextUrl.searchParams.get("days"));
  const days = d === 30 || d === 90 ? d : 7;
  const hit = cache.get(days);
  if (hit && Date.now() - hit.at < 5 * 60_000) return NextResponse.json(hit.data, { headers: { "Cache-Control": "no-store" } });

  const [clicks, visitors, accounts] = await Promise.all([
    clickStats(days),
    visitorStats(days).catch((e) => ({ connected: false as const, reason: e instanceof Error ? e.message : String(e) })),
    isConfigured() ? accountStats(days).catch(() => []) : Promise.resolve([]),
  ]);
  const data = { days, generatedAt: new Date().toISOString(), clicks, visitors, threads: { accounts } };
  cache.set(days, { at: Date.now(), data });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
