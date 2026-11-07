import type { Metadata } from "next";
import { SITE_URL, SOCIAL, alternates, jsonLd } from "@/lib/site";
import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import { getClientMarks, getProducts, getProjects, getTestimonials, getCopy, getWaLinks } from "@/content";
import Loader from "@/components/Loader";
import Clients from "@/components/Clients";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Ticket from "@/components/Ticket";
import Tile from "@/components/Tile";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { ArrowIcon, RegMark, WaIcon } from "@/components/Icons";
import { img } from "@/lib/img";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: { absolute: `Kinetic Studiow · ${(await getCopy("home", lang)).metaTitle}` }, alternates: alternates(lang, "") };
}

function Ring({ text }: { text: string }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <defs><path id="ring-p" d="M150,150 m-126,0 a126,126 0 1,1 252,0 a126,126 0 1,1 -252,0" /></defs>
      <circle cx="150" cy="150" r="146" fill="none" stroke="#1C3C6D" strokeWidth="1.5" strokeDasharray="2 5" />
      <circle cx="150" cy="150" r="108" fill="none" stroke="#1C3C6D" strokeWidth="1.5" />
      <text fontFamily="Anton,Impact,sans-serif" fontSize="19" letterSpacing="3" fill="#1C3C6D">
        <textPath href="#ring-p" textLength="785" lengthAdjust="spacing">{text}</textPath>
      </text>
    </svg>
  );
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function HomePage({ params }: Props) {
  const w = await getWaLinks();
  const { lang: locale } = await params;
  const c = (await getCopy("common", locale));
  const h = (await getCopy("home", locale));
  const [projects, products, marks, quotes] = await Promise.all([getProjects(), getProducts(), getClientMarks(), getTestimonials()]);
  const shopPicks = ["012", "013", "014", "015"].map((no) => products.find((p) => p.no === no)!).filter(Boolean);
  const workHref = href(locale, "work");

  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#studio`,
    name: "Kinetic Studiow",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/assets/badge-full-filled.png`,
    image: `${SITE_URL}/assets/mascot-full-filled.png`,
    description: locale === "id"
      ? "Studio ilustrasi di Jember: desain maskot kartun retro, identitas brand, lettering, dan grafis merch. Order lewat WhatsApp."
      : "Illustration studio in Jember, Indonesia: retro cartoon mascots, brand identity, lettering and merch graphics. Order on WhatsApp.",
    email: SOCIAL.email,
    telephone: "+6285156487036",
    address: { "@type": "PostalAddress", addressLocality: "Jember", addressRegion: "Jawa Timur", addressCountry: "ID" },
    areaServed: "Worldwide",
    knowsAbout: ["Mascot design", "Brand identity", "Custom lettering", "Merch graphics", "Vintage illustration"],
    sameAs: [SOCIAL.instagram, SOCIAL.behance, w.href("general", locale)],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <Loader c={c} />
      <main>
        <section id="hero">
          <div className="wrap">
            <div className="strip">{h.strip.map((s) => <p key={s} className="label">{s}</p>)}</div>
            <div id="hero-copy">
              <p className="eyebrow hx only-d" style={d("2.25s")}>{h.eyebrow}</p>
              <h1 id="hero-title" className="disp rough">
                {h.titleD.map((l, i) => <span key={l} className="ln hx" style={d(`${(2.3 + i * 0.08).toFixed(2)}s`)}>{l}</span>)}
              </h1>
              <p id="hero-sub" className="hx" style={d("2.75s")}>{h.sub}</p>
              <div id="hero-ctas">
                <a id="hero-cta-primary" className="btn btn-red hx" style={d("2.85s")} href={w.href("general", locale)} target="_blank" rel="noopener"><WaIcon /> {h.ctaPrimary}</a>
                <Link id="hero-cta-secondary" className="btn btn-line hx" style={d("2.92s")} href={workHref}>{h.ctaSecondary}</Link>
              </div>
            </div>
            <div id="hero-stage">
              <div id="hero-dots" className="hx-fade" style={d("2.45s")} />
              <div id="hero-ring" className="hx-fade" style={d("2.6s")}><div className="spin" style={{ width: "100%", height: "100%" }}><Ring text={h.ring} /></div></div>
              <RegMark /><RegMark /><RegMark />
              <div id="hero-mascot" className="hx-pop" style={d("2.5s")}>
                <div className="idle" style={{ ["--i" as string]: "3.2s" }}><img style={{ position: "relative" }} {...img("/assets/mascot-full.png", "(min-width: 1024px) 340px, 240px")} alt={h.mascotAlt} fetchPriority="high" /></div>
              </div>
            </div>
          </div>
        </section>

        <Clients marks={marks} c={c} />

        <Services c={c} title={h.servicesTitle} side={<p className="lede only-d" style={{ maxWidth: 420, marginBottom: 8 }}>{h.servicesSide}</p>} />

        <section id="work" className="band on-ink">
          <div className="band-ht" />
          <div className="wrap">
            <div className="sec-head">
              <div><p className="eyebrow">{h.workEyebrow}</p><h2 className="disp h2 rough">{h.workTitle}</h2></div>
              <span className="label only-m" style={{ paddingBottom: 6, color: "#D5DBE6" }}>{h.swipe}</span>
              <Link className="link only-d" href={workHref}>{h.seeAllWork} <ArrowIcon /></Link>
            </div>
            <div id="work-row">
              {projects.slice(0, 5).map((w) => <Tile key={w.id} w={w} locale={locale} c={c} href={workHref} />)}
            </div>
            <Link id="work-more" className="link only-m" href={workHref}>{h.seeAllWork} <ArrowIcon /></Link>
          </div>
        </section>

        <section id="shop" className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div><p className="eyebrow">{h.shopEyebrow}</p><h2 className="disp h2 rough">{h.shopTitle}</h2><p className="lede">{h.shopLede}</p></div>
              <div className="only-d" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                <span id="shop-note">{h.shopNote}</span>
                <Link className="link" style={{ margin: 0 }} href={href(locale, "shop")}>{h.seeShop} <ArrowIcon /></Link>
              </div>
            </div>
            <span id="shop-note-m" className="only-m">{h.shopNote}</span>
            <div className="tk-grid">{shopPicks.map((p) => <Ticket key={p.no} p={p} locale={locale} c={c} stampDelay="3.6s" />)}</div>
            <Link id="shop-more" className="link only-m" href={href(locale, "shop")}>{h.seeShop} <ArrowIcon /></Link>
          </div>
        </section>

        <Process c={c} eyebrow={h.processEyebrow} title={h.processTitle} delay="3.9s" />

        <section id="testimonials" className="sec">
          <div className="wrap">
            <div className="sec-head"><div><p className="eyebrow">{h.quotesEyebrow}</p><h2 className="disp h2 rough">{h.quotesTitle}</h2></div></div>
            <div className="quotes">
              {quotes.map((q, i) => (
                <blockquote key={i} className="quote" id={`quote-${i + 1}`}>
                  <p>{q.quote[locale]}</p>
                  <footer><strong>{q.who[locale]}</strong>{q.isPlaceholder ? <span className="tag">{h.quotePh}</span> : null}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <CtaBand locale={locale} c={c} />
      </main>
      <Footer locale={locale} c={c} current="home" />
    </>
  );
}
