import { type NextRequest, NextResponse } from "next/server";
import { forget, parseSignedRequest } from "@/lib/threads";

/** Meta calls this when the account removes the app: drop the stored token. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest((form?.get("signed_request") as string | null) ?? null);
  if (!data) return NextResponse.json({ message: "Invalid signed_request" }, { status: 400 });
  await forget();
  return NextResponse.json({ ok: true });
}
