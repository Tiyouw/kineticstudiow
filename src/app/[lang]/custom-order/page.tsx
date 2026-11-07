import "@/styles/pages/custom.css";
import type { Metadata } from "next";
import { alternates } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { getCommon } from "@/i18n/common";
import { getCustom } from "@/i18n/pages/custom";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import BriefForm from "@/components/custom/BriefForm";
import Faq from "@/components/custom/Faq";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getCustom(lang).metaTitle, description: getCustom(lang).lede, alternates: alternates(lang, "/custom-order") };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function CustomOrderPage({ params }: Props) {
  const { lang: locale } = await params;
  const c = getCommon(locale);
  const t = getCustom(locale);

  return (
    <>
      <main>
        <section id="order-head" className="band on-ink ph-band">
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

        <section id="brief">
          <div className="wrap">
            <BriefForm locale={locale} t={t} bubble={{ head: c.bubble.yourMessage, to: c.bubble.to, meta: c.bubble.meta }} />
          </div>
        </section>

        <Process
          c={c}
          id="steps"
          delay="1.2s"
          eyebrow={t.stepsEyebrow}
          title={<>{t.stepsTitle[0]}<br className="only-m" /> {t.stepsTitle[1]}</>}
        />

        <section id="faq" className="sec">
          <div className="wrap">
            <div id="faq-head" className="sec-head">
              <div><p className="eyebrow">{t.faqEyebrow}</p><h2 className="disp h2 rough">{t.faqTitle}</h2></div>
            </div>
            <Faq items={t.faq} tag={t.faqPh} />
          </div>
        </section>
      </main>
      <Footer locale={locale} c={c} current="custom" />
    </>
  );
}
