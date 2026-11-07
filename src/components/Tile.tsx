import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/content";
import type { CommonDict } from "@/i18n/common";

export function TileInner({ w, locale, c }: { w: Project; locale: Locale; c: CommonDict }) {
  const cat = c.categories[w.category];
  return (
    <>
      <div className={`tile-art ${w.tone}`}>
        <span className="tile-no">{w.id}</span>
        <img src={w.image} alt={w.real ? w.title[locale] : locale === "id" ? "Gambar placeholder" : "Placeholder art"} />
      </div>
      <div className="tile-cap">
        <strong>{w.title[locale]}</strong>
        <span>{cat} · {w.real ? (locale === "id" ? "Project asli" : "Real project") : w.year[locale]}</span>
      </div>
    </>
  );
}

/** Work tile linking somewhere (Home links to the Work page; Work opens a sheet with its own button). */
export default function Tile({ w, locale, c, href }: { w: Project; locale: Locale; c: CommonDict; href: string }) {
  return <Link className="tile" id={`work-${w.id}`} href={href}><TileInner w={w} locale={locale} c={c} /></Link>;
}
