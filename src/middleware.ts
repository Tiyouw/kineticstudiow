import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n";

/**
 * English is the default and has no prefix (/, /work, /shop/x); Indonesian lives under /id.
 * - /en and /en/... are old URLs: 308 to the same path without /en (query kept).
 * - /id/... is served as it is.
 * - anything else is English: rewritten (not redirected) to the [lang]="en" route.
 * No language detection from Accept-Language or cookies: without /id a visitor always gets English.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (first === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (first === "id") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!_next|assets|api|favicon.ico|tiyoouw-mark.js|robots.txt|sitemap.xml|studio|q/|.*opengraph-image.*|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|txt|xml)$).*)"] };
