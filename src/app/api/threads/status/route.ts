import { NextResponse } from "next/server";
import { getAccounts, isConfigured } from "@/lib/threads";

export const dynamic = "force-dynamic";

/** For the Studio: which Threads accounts are connected. Never the tokens. */
export async function GET() {
  const list = isConfigured() ? await getAccounts().catch(() => []) : [];
  return NextResponse.json(
    {
      configured: isConfigured(),
      accounts: list.map((a) => ({
        id: a.userId,
        username: a.username ?? null,
        connected: !!a.token,
        expiresAt: a.token ? a.expiresAt ?? null : null,
        lastError: a.lastError ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
