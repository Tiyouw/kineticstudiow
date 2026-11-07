import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { forget } from "@/lib/threads";

export const dynamic = "force-dynamic";

const db = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "raw", token: process.env.SANITY_API_WRITE_TOKEN, stega: false });

/**
 * Fallback for "Putuskan" in the Studio, used only when the editor's own session can't delete the account doc.
 * Proof of membership: the Studio first writes a short-lived `threadsDisconnect` request doc with the editor's own
 * session (only project members can write to the dataset), then calls this with its id. Anything else is refused.
 */
export async function POST(req: NextRequest) {
  const { request } = (await req.json().catch(() => ({}))) as { request?: string };
  if (!request || !/^threadsDisconnect-[a-zA-Z0-9-]{8,64}$/.test(request)) return NextResponse.json({ message: "Bad request" }, { status: 400 });
  const r = await db.fetch<{ account?: string; _createdAt: string } | null>(`*[_id == $id && _type == "threadsDisconnect"][0]{account, _createdAt}`, { id: request });
  if (!r?.account || Date.now() - new Date(r._createdAt).getTime() > 5 * 60_000) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await forget(r.account);
  await db.delete(request).catch(() => {});
  return NextResponse.json({ ok: true });
}
