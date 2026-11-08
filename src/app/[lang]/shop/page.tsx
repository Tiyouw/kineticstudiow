import "@/styles/pages/shop.css";
import type { Metadata } from "next";
import { alternates } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { getProducts, getCopy } from "@/content";
import Ticket from "@/components/Ticket";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import ShopFilter from "@/components/shop/ShopFilter";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const s = (await getCopy("shop", lang));
  return { title: s.metaTitle, description: s.metaDesc, alternates: alternates(lang, "/shop") };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function ShopPage({ params }: Props) {
  const { lang: locale } = await params;
  const c = (await getCopy("common", locale));
  const s = (await getCopy("shop", locale));
  const products = await getProducts();
  const total = products.length;
  const word = (n: number) => (n === 1 ? s.one : s.many);
  const nAvail = products.filter((p) => !p.sold).length;
  const nSold = total - nAvail;
  let soldIdx = 0;

  return (
    <>
      <main>
        <section id="shop-head" className="band on-ink ph-band">
          <div className="band-ht" />
          <div className="wrap">
            <div className="strip"><p className="label">{s.pageName}</p><p className="label">{s.place}</p></div>
            <div className="phead">
              <p className="eyebrow hx" style={d(".6s")}>{s.eyebrow}</p>
              <h1 className="disp rough">
                {s.title.map((l, i) => <span key={l} className="ln hx" style={d(`${(0.65 + i * 0.08).toFixed(2)}s`)}>{l}</span>)}
              </h1>
              <p className="lede hx" style={d(".85s")}>{s.lede}</p>
            </div>
          </div>
        </section>

        <section id="how" className="sec">
          <div className="wrap">
            {/* the visible eyebrow is a styled <p>; this h2 keeps the heading order h1 > h2 > h3 for screen readers */}
            <h2 className="sr-only">{s.howEyebrow}</h2>
            <p className="eyebrow" aria-hidden="true">{s.howEyebrow}</p>
            <ol>
              {s.steps.map((st, i) => (
                <li key={st.title}><span className="how-no" aria-hidden="true">{i + 1}</span><div><h3>{st.title}</h3><p>{st.desc}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section id="catalog" className="sec">
          <div className="wrap">
            <ShopFilter
              labels={s.filters}
              aria={s.filterAria}
              title={s.shelfTitle}
              counts={{
                all: s.countAll.replace("{n}", String(total)),
                available: s.countAvailable.replace("{m}", word(nAvail)),
                sold: s.countSold.replace("{m}", word(nSold)),
              }}
            >
              {products.map((p) => (
                <Ticket key={p.no} p={p} locale={locale} c={c} stampDelay={p.sold ? `${(1.2 + 0.25 * soldIdx++).toFixed(2)}s` : undefined} />
              ))}
            </ShopFilter>
            <div id="licence">
              <h3>{s.licenceTitle}</h3>
              <p>{s.licence}</p>
              {s.licencePh ? <span className="tag">{s.licencePh}</span> : null}
            </div>
          </div>
        </section>

        <CtaBand locale={locale} c={c} title={s.ctaTitle} sub={s.ctaSub} />
      </main>
      <Footer locale={locale} c={c} current="shop" />
    </>
  );
}
