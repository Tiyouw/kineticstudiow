import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { resend, takeDown } from "@/lib/threads";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // sending again waits for Threads to process the images

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });

/**
 * "Kirim ulang" / "Hapus dari Threads" on a Journal post. Same proof of membership as /api/threads/disconnect: the
 * Studio first writes a short-lived `threadsAction` request doc with the editor's own session, then calls this with its id.
 */
export async function POST(req: NextRequest) {
  const { request } = (await req.json().catch(() => ({}))) as { request?: string };
  if (!request || !/^threadsAction-[a-zA-Z0-9-]{8,64}$/.test(request)) return NextResponse.json({ message: "Bad request" }, { status: 400 });
  const r = await db.fetch<{ action?: string; post?: string; account?: string; _createdAt: string } | null>(
    `*[_id == $id && _type == "threadsAction"][0]{action, post, account, _createdAt}`, { id: request },
  );
  await db.delete(request).catch(() => {});
  if (!r || Date.now() - new Date(r._createdAt).getTime() > 5 * 60_000) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!r.post || !/^[\w.-]{1,128}$/.test(r.post) || r.post.startsWith("drafts.") || !r.account || !/^\d{5,30}$/.test(r.account)) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const ref = { postId: r.post, account: r.account };
  try {
    if (r.action === "takedown") await takeDown(ref);
    else if (r.action === "resend") await resend(ref);
    else return NextResponse.json({ message: "Bad request" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
