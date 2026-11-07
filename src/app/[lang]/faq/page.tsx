import "@/styles/pages/custom.css";
import "@/styles/pages/faq.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getCopy } from "@/content";
import { alternates, jsonLd } from "@/lib/site";
import { href, type Locale } from "@/lib/i18n";
import Faq from "@/components/custom/Faq";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { ArrowIcon } from "@/components/Icons";

/**
 * The answers are drafts until Fatwa confirms them. While false the page is noindex, unlinked, out of the sitemap,
 * shows a "draft" tag on each answer and has no FAQPage data for search engines.
 */
const FAQ_LIVE = false;

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = await getCopy("faq", lang);
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: alternates(lang, "/faq"),
    ...(FAQ_LIVE ? {} : { robots: { index: false, follow: true } }),
  };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function FaqPage({ params }: Props) {
  const { lang: locale } = await params;
  const [c, t] = await Promise.all([getCopy("common", locale), getCopy("faq", locale)]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.groups.flatMap((g) => g.items).map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <>
      {FAQ_LIVE ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} /> : null}
      <main>
        <section id="faq-top" className="band on-ink ph-band">
          <div className="band-ht" />
          <div className="wrap">
            <div className="strip"><p className="label">{t.pageName}</p><p className="label">{c.footer.place}</p></div>
            <div className="phead">
              <p className="eyebrow hx" style={d(".6s")}>{t.eyebrow}</p>
              <h1 className="disp rough">
                {t.titleLines.map((l, i) => <span key={l} className="ln hx" style={d(`${(0.65 + i * 0.08).toFixed(2)}s`)}>{l}{" "}</span>)}
              </h1>
              <p className="lede hx" style={d(".85s")}>{t.lede}</p>
            </div>
          </div>
        </section>

        {t.groups.map((g, gi) => (
          <section key={g.title} className="sec faq-group">
            <div className="wrap">
              <div className="sec-head faq-group-head">
                <div><p className="eyebrow">{String(gi + 1).padStart(2, "0")}</p><h2 className="disp h2 rough">{g.title}</h2></div>
              </div>
              <Faq items={g.items} tag={FAQ_LIVE ? undefined : t.draftTag} idPrefix={`faq${gi}`} />
            </div>
          </section>
        ))}

        <p className="faq-more wrap">
          <Link className="link" href={href(locale, "custom")}>{c.nav.custom} <ArrowIcon /></Link>
          <Link className="link" href={href(locale, "shop")}>{c.nav.shop} <ArrowIcon /></Link>
        </p>
      </main>
      <CtaBand locale={locale} c={c} title={t.ctaTitle} />
      <Footer locale={locale} c={c} />
    </>
  );
}
