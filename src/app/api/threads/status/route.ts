import { NextResponse } from "next/server";
import { getAuth, isConfigured } from "@/lib/threads";

export const dynamic = "force-dynamic";

/** For the Studio's Threads pane: connection state only, never the token. */
export async function GET() {
  const a = isConfigured() ? await getAuth().catch(() => null) : null;
  return NextResponse.json(
    {
      configured: isConfigured(),
      connected: !!a?.token,
      username: a?.username ?? null,
      expiresAt: a?.token ? a.expiresAt ?? null : null,
      lastError: a?.lastError ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
