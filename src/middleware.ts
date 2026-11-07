import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

/** Every page lives under /id or /en. Bare paths go to the default language (EN). */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|assets|api|favicon.ico|tiyoouw-mark.js|robots.txt|sitemap.xml|studio|q/|.*opengraph-image.*|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|txt|xml)$).*)"] };
