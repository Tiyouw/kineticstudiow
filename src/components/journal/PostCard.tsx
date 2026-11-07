import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Post } from "@/content";

/** "8 November 2026" / "8 November 2026", in Jember's time zone. */
export function postDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}

export const postHref = (locale: Locale, slug: string) => `/${locale}/journal/${slug}`;

/** A Journal post as a tile: cover on top, title and date below (the work tiles' style). */
export default function PostCard({ p, locale, lazy, featured }: { p: Post; locale: Locale; lazy?: boolean; featured?: boolean }) {
  return (
    <Link className={"tile jr-card" + (featured ? " jr-featured" : "")} href={postHref(locale, p.slug)}>
      <div className="tile-art jr-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.cover} alt={p.title[locale]} loading={lazy ? "lazy" : undefined} />
      </div>
      <div className="tile-cap">
        <strong>{p.title[locale]}</strong>
        <span><time dateTime={p.publishedAt}>{postDate(p.publishedAt, locale)}</time></span>
      </div>
    </Link>
  );
}
