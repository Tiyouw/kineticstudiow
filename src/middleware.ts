import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

/** Every page lives under /id or /en. Bare paths go to the default language (ID). */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) {
    // the 404 page has no params: it reads the language from this header
    const headers = new Headers(req.headers);
    headers.set("x-locale", first);
    return NextResponse.next({ request: { headers } });
  }
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|assets|api|favicon.ico|tiyoouw-mark.js|robots.txt|sitemap.xml|.*opengraph-image.*|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|txt|xml)$).*)"] };
