import "@/styles/pages/product.css";
import type { Metadata } from "next";
import { SITE_URL, alternates, jsonLd } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, locales, type Locale } from "@/lib/i18n";
import { fill } from "@/i18n/pages/product";
import { prices, getProduct, getProducts, getCopy, getWaLinks } from "@/content";
import Ticket from "@/components/Ticket";
import Bubble from "@/components/Bubble";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { ArrowIcon, CheckIcon, MailIcon, WaIcon } from "@/components/Icons";
import Gallery, { type View } from "@/components/shop/Gallery";

type Props = { params: Promise<{ lang: Locale; slug: string }> };

// products added in the Studio get their page on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

/** "BURGER BROS" -> "Burger Bros" for running text. */
const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const t = (await getCopy("product", lang));
  const name = titleCase(p.name);
  return {
    title: `#${p.no} ${name} · ${t.bandL}`,
    description: fill(p.sold ? t.soldOnce : t.once, { name }),
    alternates: alternates(lang, `/shop/${p.slug}`),
  };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function ProductPage({ params }: Props) {
  const w = await getWaLinks();
  const { lang: locale, slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const c = (await getCopy("common", locale));
  const t = (await getCopy("product", locale));
  const all = await getProducts();
  const name = titleCase(p.name);
  const pr = prices(p, locale);
  const price = pr.main;
  const wa = { no: p.no, name: p.name, price };

  // the next three other products, wrapping around the list, available ones first
  const start = all.findIndex((x) => x.no === p.no);
  const others = [...all.slice(start + 1), ...all.slice(0, start)];
  const more = [...others.filter((x) => !x.sold), ...others.filter((x) => x.sold)].slice(0, 3);

  const views: View[] = (p.gallery.length ? p.gallery : [p.image]).map((src, i) => ({
    src,
    tone: i === 0 ? p.tone : "",
    label: `${t.view} ${i + 1}`,
    alt: fill(t.imgAlt, { name, n: i + 1 }),
    aria: fill(t.showView, { n: i + 1 }),
  }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `#${p.no} ${name}`,
    sku: p.no,
    image: [p.image, ...p.gallery].map((src) => SITE_URL + src),
    description: fill(p.sold ? t.soldOnce : t.once, { name }),
    brand: { "@type": "Brand", name: "Kinetic Studiow" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${locale}/shop/${p.slug}`,
      // English pages are for buyers abroad: USD there, rupiah on the Indonesian pages
      priceCurrency: locale === "en" && p.priceUsd ? "USD" : "IDR",
      price: locale === "en" && p.priceUsd ? p.priceUsd : p.priceIdr,
      availability: p.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#studio` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <main>
        <nav id="crumbs" aria-label={t.crumbsAria}>
          <div className="wrap">
            <ol>
              <li><Link href={href(locale, "shop")}>{t.shop}</Link></li>
              <li aria-current="page">#{p.no}</li>
            </ol>
          </div>
        </nav>

        <section id="product" className={p.sold ? "is-sold" : undefined}>
          <div className="wrap">
            <Gallery views={views} no={p.no} aria={t.galleryAria} ph={p.isPlaceholder ? c.product.placeholder : undefined} stamp={p.sold ? c.product.sold : undefined} />
            <div id="pinfo">
              <div className="tk-band"><span>{t.bandL}</span><span>{t.bandR}</span></div>
              <div id="pinfo-body">
                <span id="p-no" className="hx" style={d(".6s")}>#{p.no}</span>
                <h1 id="p-name" className="disp rough hx" style={d(".68s")}>{name}</h1>
                <p id="p-status" className="tk-status hx" style={d(".76s")}>{p.sold ? c.product.sold : c.product.available}</p>
                <p id="p-price" className="hx" style={d(".84s")}>
                  <b>{price}</b>
                  {pr.was && !p.sold ? <><span className="was-l">{t.was}</span><span className="was">{pr.was}<i /></span></> : null}
                  {pr.alt ? <span className="p-alt">{pr.alt}</span> : null}
                </p>
                <div id="p-actions" className="hx" style={d(".95s")}>
                  {p.sold ? (
                    <span className="btn tk-gone" aria-disabled="true">{c.product.gone}</span>
                  ) : (
                    <a className="btn btn-red" href={w.href("order", locale, wa)} target="_blank" rel="noopener"><WaIcon /> {c.product.order}</a>
                  )}
                  <a className="btn btn-line" href={w.href("ask", locale, wa)} target="_blank" rel="noopener">{t.ask}</a>
                  {locale === "en" ? <a className="mail-alt" href={w.mail(p.sold ? "general" : "order", locale, wa)}><MailIcon /> {c.emailInstead}</a> : null}
                </div>
                {p.sold ? (
                  <div id="p-sold" className="hx" style={d("1.05s")}>
                    <p>{t.soldNote}</p>
                    <Link className="link" href={href(locale, "custom")}>{t.soldCta} <ArrowIcon /></Link>
                  </div>
                ) : (
                  <Bubble text={w.text("order", locale, wa)} head={t.orderMsg} to={c.bubble.to} meta={c.bubble.meta} />
                )}
              </div>
              <div className="tk-stub"><span className="tk-admit">{c.product.admit}</span><span className="tk-seat">{c.product.seat}<b>{p.no}</b></span></div>
            </div>
          </div>
        </section>

        <section id="included">
          <div className="wrap">
            <div id="get">
              <p className="eyebrow">{t.getEyebrow}</p>
              <h2 className="disp h2 rough">{t.getTitle}</h2>
              <ul id="get-list">{t.gets.map((g) => <li key={g}><CheckIcon />{g}</li>)}</ul>
              <span className="tag">{t.getPh}</span>
            </div>
            <div id="once">
              <h3>{p.sold ? t.soldTitle : t.onceTitle}</h3>
              <p>{fill(p.sold ? t.soldOnce : t.once, { name })}</p>
            </div>
          </div>
        </section>

        <section id="more" className="sec">
          <div className="wrap">
            <div className="sec-head"><div><p className="eyebrow">{t.moreEyebrow}</p><h2 className="disp h2 rough">{t.moreTitle}</h2></div></div>
            <div id="more-row">
              {more.map((x) => <Ticket key={x.no} p={x} locale={locale} c={c} stampDelay=".4s" />)}
              <Link id="more-all" className="only-d" href={href(locale, "shop")}>
                <span className="eyebrow">{t.allEyebrow}</span>
                <strong>{fill(t.seeAll, { n: all.length })}</strong>
                <span className="link">{t.theShop} <ArrowIcon /></span>
              </Link>
            </div>
            <Link id="more-shop" className="link only-m" href={href(locale, "shop")}>{t.seeShop} <ArrowIcon /></Link>
          </div>
        </section>

        <CtaBand locale={locale} c={c} />
      </main>
      <Footer locale={locale} c={c} current="shop" />
    </>
  );
}
