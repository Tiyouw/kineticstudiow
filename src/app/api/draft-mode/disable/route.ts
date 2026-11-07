import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves draft mode (the "Keluar pratinjau" link): back to the published site. */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const to = req.nextUrl.searchParams.get("to") ?? "/";
  return NextResponse.redirect(new URL(to.startsWith("/") && !to.startsWith("//") ? to : "/", req.url));
}
