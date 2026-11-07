import "@/styles/pages/notfound.css";
import { getCopy, getWaLinks } from "@/content";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { href, isLocale, type Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";
import { ArrowIcon, WaIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "404", robots: { index: false } };

const d = (s: string) => ({ ["--d" as string]: s });

export default async function NotFound() {
  const w = await getWaLinks();
  const h = (await headers()).get("x-locale") ?? "";
  const locale: Locale = isLocale(h) ? h : "id";
  const c = (await getCopy("common", locale));
  const t = (await getCopy("notfound", locale));
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
              <img className="nf-bird" src="/assets/peace-hand-filled.png" alt={t.art} width={790} height={900} />
              <span className="nf-stamp" aria-hidden="true">{t.stamp}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} c={c} />
    </>
  );
}
