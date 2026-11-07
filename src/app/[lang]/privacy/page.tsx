import "@/styles/pages/journal.css";
import type { Metadata } from "next";
import { getCopy } from "@/content";
import { alternates } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = await getCopy("privacy", lang);
  return { title: t.metaTitle, description: t.metaDesc, alternates: alternates(lang, "/privacy") };
}

export default async function PrivacyPage({ params }: Props) {
  const { lang: locale } = await params;
  const [c, t] = await Promise.all([getCopy("common", locale), getCopy("privacy", locale)]);
  return (
    <>
      <main>
        <section id="privacy-head" className="band on-ink ph-band">
          <div className="band-ht" />
          <div className="wrap">
            <div className="strip"><p className="label">{t.pageName}</p><p className="label">{c.footer.place}</p></div>
            <div className="phead">
              <p className="eyebrow">{t.eyebrow}</p>
              <h1 className="disp rough">{t.titleLines.map((l) => <span key={l} className="ln">{l}{" "}</span>)}</h1>
              <p className="lede">{t.updated}</p>
            </div>
          </div>
        </section>
        <section id="privacy" className="sec">
          <div className="wrap jr-body pv-body">
            {t.sections.map((s) => (
              <section key={s.h}>
                <h2 className="disp">{s.h}</h2>
                <p>{s.p}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} c={c} />
    </>
  );
}
