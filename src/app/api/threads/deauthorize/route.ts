import { type NextRequest, NextResponse } from "next/server";
import { forget, parseSignedRequest } from "@/lib/threads";

/** Meta calls this when an account removes the app: drop that account's stored token. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest((form?.get("signed_request") as string | null) ?? null);
  if (!data) return NextResponse.json({ message: "Invalid signed_request" }, { status: 400 });
  await forget(data.user_id ? String(data.user_id) : undefined);
  return NextResponse.json({ ok: true });
}
