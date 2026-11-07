import "@/styles/pages/journal.css";
import type { Metadata } from "next";
import { getCopy, getPosts } from "@/content";
import { alternates } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import PostCard from "@/components/journal/PostCard";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const [t, posts] = await Promise.all([getCopy("journal", lang), getPosts()]);
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: { ...alternates(lang, "/journal"), types: { "application/rss+xml": `/journal/feed.xml?lang=${lang}` } },
    // an empty journal stays out of search results until the first post
    ...(posts.length ? {} : { robots: { index: false, follow: true } }),
  };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function JournalPage({ params }: Props) {
  const { lang: locale } = await params;
  const [c, t, posts] = await Promise.all([getCopy("common", locale), getCopy("journal", locale), getPosts()]);

  return (
    <>
      <main>
        <section id="journal-head" className="band on-ink ph-band">
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

        <section id="journal-list" className="sec">
          <div className="wrap">
            {posts.length ? (
              <div className="jr-grid">
                {posts.map((p, i) => <PostCard key={p.slug} p={p} locale={locale} featured={i === 0} lazy={i > 2} />)}
              </div>
            ) : (
              <p className="jr-empty">{t.empty}</p>
            )}
            <p className="jr-feed"><a className="link" href={`/journal/feed.xml?lang=${locale}`}>{t.feed}</a></p>
          </div>
        </section>
      </main>
      <CtaBand locale={locale} c={c} title={t.ctaTitle} sub={t.ctaSub} />
      <Footer locale={locale} c={c} />
    </>
  );
}
