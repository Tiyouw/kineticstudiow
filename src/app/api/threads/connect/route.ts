import { NextResponse } from "next/server";
import { authorizeUrl, isConfigured } from "@/lib/threads";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** "Sambungkan Threads" in the Studio: off to Threads to approve the app. */
export function GET() {
  if (!isConfigured()) return NextResponse.redirect(`${SITE_URL}/studio/structure/threads?error=${encodeURIComponent("Aplikasi Threads belum dikonfigurasi (App Secret belum dipasang).")}`);
  return NextResponse.redirect(authorizeUrl());
}
