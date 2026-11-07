import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { forget, parseSignedRequest } from "@/lib/threads";
import { SITE_URL } from "@/lib/site";

/** Meta's data deletion callback: the only data held is that account's token, so delete it and confirm. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = parseSignedRequest((form?.get("signed_request") as string | null) ?? null);
  if (!data) return NextResponse.json({ message: "Invalid signed_request" }, { status: 400 });
  await forget(data.user_id ? String(data.user_id) : undefined);
  const code = randomUUID();
  return NextResponse.json({ url: `${SITE_URL}/en/privacy?deletion=${code}`, confirmation_code: code });
}
