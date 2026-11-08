import "@/styles/pages/about.css";
import type { Metadata } from "next";
import { alternates } from "@/lib/site";
import { href, type Locale } from "@/lib/i18n";
import { getClientMarks, getCopy, getWaLinks } from "@/content";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Clients from "@/components/Clients";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import TiyoouwCredit from "@/components/TiyoouwCredit";
import { ArrowIcon, RegMark } from "@/components/Icons";
import { img } from "@/lib/img";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const a = await getCopy("about", lang);
  return { title: a.metaTitle, description: a.metaDesc, alternates: alternates(lang, "/about") };
}

const d = (s: string) => ({ ["--d" as string]: s });

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
  </svg>
);

export default async function AboutPage({ params }: Props) {
  const w = await getWaLinks();
  const { lang: locale } = await params;
  const c = (await getCopy("common", locale));
  const a = (await getCopy("about", locale));
  const marks = await getClientMarks();

  const contacts = [
    { k: "Instagram", v: "@kinetic.studiow", h: "https://instagram.com/kinetic.studiow", ext: true },
    { k: "TikTok", v: "@kinetic.studiow", h: "https://www.tiktok.com/@kinetic.studiow", ext: true },
    { k: "Behance", v: "kineticstd", h: "https://behance.net/kineticstd", ext: true },
    { k: a.email, v: "hello@kineticstudiow.my.id", h: "mailto:hello@kineticstudiow.my.id", ext: false },
    { k: "WhatsApp", v: a.waValue, h: w.href("general", locale), ext: true },
  ];

  return (
    <>
      <main>
        <section id="intro">
          <div className="wrap">
            <div className="strip">{a.strip.map((s) => <p key={s} className="label">{s}</p>)}</div>
            <div id="intro-grid">
              <div id="intro-copy">
                <p className="eyebrow hx" style={d(".6s")}>{a.eyebrow}</p>
                <h1 className="disp rough">
                  {a.title.map((l, i) => (
                    <span key={l}>{i > 0 ? " " : null}<span className="ln hx" style={d(`${(0.65 + i * 0.08).toFixed(2)}s`)}>{l}</span></span>
                  ))}
                </h1>
                <p id="intro-bio" className="hx" style={d(".9s")}>
                  {a.bioA}
                  <span className="uline" style={{ ["--ud" as string]: "1.4s" }}>
                    {a.bioMark}
                    <svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C 22 3, 40 11, 60 6 S 98 3, 118 7" /></svg>
                  </span>
                  {a.bioB}
                </p>
                <span className="tag hx" style={d("1s")}>{a.bioPh}</span>
              </div>
              <div id="portrait">
                <RegMark /><RegMark />
                <div id="portrait-dots" className="hx-fade" style={d(".8s")} />
                <div id="portrait-hand" style={d("1.1s")}><img {...img("/assets/peace-hand-filled.png", "(min-width: 1024px) 360px, 240px")} alt={a.handAlt} fetchPriority="high" /></div>
                <div id="photo-ph" className="hx" style={d("1.4s")}>
                  <CameraIcon />
                  <strong>{a.photo}</strong>
                  <span className="tag">{a.photoPh}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Services
          c={c}
          count={6}
          id="draws"
          eyebrow={a.drawsEyebrow}
          title={a.drawsTitle}
          side={<p className="lede only-d" style={{ maxWidth: 420, marginBottom: 8 }}>{a.drawsSide}</p>}
        />

        <Process c={c} id="works" eyebrow={a.worksEyebrow} title={<>{a.worksTitle[0]}<br />{a.worksTitle[1]}</>} delay="2.2s" />

        <Clients marks={marks} c={c} id="worked" />

        <section id="contact" className="sec">
          <div className="wrap">
            <div className="sec-head"><div><p className="eyebrow">{a.contactEyebrow}</p><h2 className="disp h2 rough">{a.contactTitle}</h2></div></div>
            <ul id="contact-list">
              {contacts.map((x) => (
                <li key={x.k}>
                  <a href={x.h} {...(x.ext ? { target: "_blank", rel: "noopener" } : {})}>
                    <small>{x.k}</small><strong>{x.v}</strong><ArrowIcon />
                  </a>
                </li>
              ))}
            </ul>
            <p id="about-credits">
              <TiyoouwCredit><span>{a.creditsLabel} <b>{a.creditsName}</b> (tiyoouw.com)</span></TiyoouwCredit>
            </p>
          </div>
        </section>

        <CtaBand locale={locale} c={c} />
      </main>
      <Footer locale={locale} c={c} current="about" />
    </>
  );
}
