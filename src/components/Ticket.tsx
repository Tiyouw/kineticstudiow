import Link from "next/link";
import { productHref, type Locale } from "@/lib/i18n";
import { formatIdr, formatUsd, type Product, getWaLinks } from "@/content";
import type { CommonDict } from "@/i18n/common";
import { img } from "@/lib/img";

/** Premade mascot as a ticket stub. `stampDelay` sets when the SOLD stamp slams in (CSS --sd). */
export default async function Ticket({ p, locale, c, stampDelay }: { p: Product; locale: Locale; c: CommonDict; stampDelay?: string }) {
  const w = await getWaLinks();
  const link = productHref(locale, p.slug);
  const price = formatIdr(p.priceIdr);
  const t = c.product;
  return (
    <article className={"tk" + (p.sold ? " sold" : "")} id={`tk-${p.no}`} data-status={p.sold ? "sold" : "available"}>
      <div className="tk-band"><span>{t.premade}</span><span>{t.exclusive}</span></div>
      <Link className={`tk-art ${p.tone}`} href={link} aria-label={`${p.name}, ${t.seeDetails}`}>
        <img {...img(p.image, "(min-width: 1024px) 200px, 160px")} alt="" loading="lazy" />
        {p.isPlaceholder ? <span className="tk-ph">{t.placeholder}</span> : null}
        {p.sold ? <span className="stamp" style={stampDelay ? { ["--sd" as string]: stampDelay } : undefined}>{t.sold}</span> : null}
      </Link>
      <div className="tk-body">
        <span className="tk-no">#{p.no}</span>
        <h3 className="tk-name"><Link href={link}>{p.name}</Link></h3>
        <p className="tk-status">{p.sold ? t.sold : t.available}</p>
        <p className="tk-price"><b>{price}</b>{formatUsd(p.priceUsd)}{p.wasIdr ? <> <s>{formatIdr(p.wasIdr)}</s></> : null}</p>
        {p.sold ? (
          <span className="btn tk-btn tk-gone" aria-disabled="true">{t.gone}</span>
        ) : (
          <a className="btn btn-red tk-btn" href={w.href("order", locale, { no: p.no, name: p.name, price })} target="_blank" rel="noopener">{t.order}</a>
        )}
      </div>
      <div className="tk-stub"><span className="tk-admit">{t.admit}</span><span className="tk-seat">{t.seat}<b>{p.no}</b></span></div>
    </article>
  );
}
