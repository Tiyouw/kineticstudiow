import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { pingIndexNow } from "@/lib/indexnow";
import { publishPending } from "@/lib/threads";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });
const STATE = "secrets.schedule"; // private (dotted id): when the last run happened

/**
 * Scheduled Journal posts: a post whose "Tanggal terbit" is in the future stays hidden until then. Every 15 minutes
 * (.github/workflows/schedule.yml; Vercel Hobby crons run only daily) this shows the posts that came due since the
 * last run, tells Bing, and sends them to the Threads accounts ticked on them.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.SCHEDULE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();
  const last = (await db.fetch<string | null>(`*[_id == $id][0].lastRun`, { id: STATE })) ?? new Date(Date.now() - 60 * 60_000).toISOString();
  const due = await db.fetch<string[]>(
    `*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current) && publishedAt > $last && publishedAt <= $now].slug.current`,
    { last, now },
  );
  if (due.length) {
    revalidateTag("sanity");
    await pingIndexNow(due.flatMap((s) => locales.flatMap((l) => [`${SITE_URL}/${l}/journal/${s}`, `${SITE_URL}/${l}/journal`])));
  }
  await db.createIfNotExists({ _id: STATE, _type: "scheduleState" });
  await db.patch(STATE).set({ lastRun: now }).commit();
  const threads = await publishPending().catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
  return NextResponse.json({ due, threads });
}
