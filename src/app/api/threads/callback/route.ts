import { type NextRequest, NextResponse } from "next/server";
import { checkState, connect, noteError } from "@/lib/threads";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const back = (q: string) => NextResponse.redirect(`${SITE_URL}/studio/structure/threads?${q}`);

/** Threads sends the user back here with a one-time code after they approve. */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (!checkState(p.get("state"))) return NextResponse.json({ message: "Invalid or expired state" }, { status: 400 });
  if (p.get("error")) return back(`error=${encodeURIComponent(p.get("error_description") ?? p.get("error") ?? "Dibatalkan")}`);
  const code = p.get("code");
  if (!code) return back(`error=${encodeURIComponent("Threads tidak mengirim kode.")}`);
  try {
    const username = await connect(code);
    return back(`ok=1&user=${encodeURIComponent(username)}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await noteError(msg);
    return back(`error=${encodeURIComponent(msg)}`);
  }
}
