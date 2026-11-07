import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/content";
import type { CommonDict } from "@/i18n/common";
import { img } from "@/lib/img";

export function TileInner({ w, locale, c, lazy }: { w: Project; locale: Locale; c: CommonDict; lazy?: boolean }) {
  const cat = c.categories[w.category];
  return (
    <>
      <div className={`tile-art ${w.tone}`}>
        <span className="tile-no">{w.id}</span>
        <img {...img(w.image, "(min-width: 1024px) 600px, 80vw")} loading={lazy ? "lazy" : undefined} alt={w.real ? w.title[locale] : locale === "id" ? "Gambar placeholder" : "Placeholder art"} />
      </div>
      <div className="tile-cap">
        <strong>{w.title[locale]}</strong>
        <span>{cat} · {w.real ? (locale === "id" ? "Project asli" : "Real project") : w.year[locale]}</span>
      </div>
    </>
  );
}

/** Work tile linking somewhere (Home links to the Work page; Work opens a sheet with its own button). */
/** Home shows these far below the fold, so they load lazily. */
export default function Tile({ w, locale, c, href }: { w: Project; locale: Locale; c: CommonDict; href: string }) {
  return <Link className="tile" id={`work-${w.id}`} href={href}><TileInner w={w} locale={locale} c={c} lazy /></Link>;
}
