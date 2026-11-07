import "@/styles/pages/notfound.css";
import { getCopy, getWaLinks } from "@/content";
import type { Metadata } from "next";
import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";
import NotFoundPick from "@/components/NotFoundPick";
import { ArrowIcon, WaIcon } from "@/components/Icons";
import { img } from "@/lib/img";

export const metadata: Metadata = { robots: { index: false } };

const d = (s: string) => ({ ["--d" as string]: s });

async function View({ locale }: { locale: Locale }) {
  const w = await getWaLinks();
  const [c, t] = await Promise.all([getCopy("common", locale), getCopy("notfound", locale)]);
  return (
    <>
      <main>
        <section id="nf">
          <div className="wrap nf-in">
            <div className="nf-copy">
              <p className="eyebrow hx" style={d(".15s")}>{t.eyebrow}</p>
              <h1 className="disp rough nf-title">
                {t.title.map((l, i) => <span key={l} className="ln hx" style={d(`${(0.2 + i * 0.08).toFixed(2)}s`)}>{l}</span>)}
              </h1>
              <p className="nf-lede hx" style={d(".5s")}>{t.lede}</p>
              <div className="nf-ctas hx" style={d(".6s")}>
                <Link className="btn btn-red" href={href(locale, "home")}>{t.home}</Link>
                <Link className="btn btn-line" href={href(locale, "shop")}>{t.shop} <ArrowIcon /></Link>
                <a className="btn btn-line" href={w.href("general", locale)} target="_blank" rel="noopener"><WaIcon /> {t.ask}</a>
              </div>
            </div>
            <div className="nf-art">
              <span className="nf-num" aria-hidden="true">404</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="nf-bird" {...img("/assets/peace-hand-filled.png", "(min-width: 1024px) 380px, 320px")} alt={t.art} width={790} height={900} />
              <span className="nf-stamp" aria-hidden="true">{t.stamp}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} c={c} />
    </>
  );
}

export default async function NotFound() {
  const [id, en] = await Promise.all([getCopy("notfound", "id"), getCopy("notfound", "en")]);
  return (
    <NotFoundPick
      id={<View locale="id" />}
      en={<View locale="en" />}
      titles={{ id: `404 · ${id.metaTitle} · Kinetic Studiow`, en: `404 · ${en.metaTitle} · Kinetic Studiow` }}
    />
  );
}
