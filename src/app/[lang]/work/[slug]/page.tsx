import "@/styles/pages/work.css";
import "@/styles/pages/project.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL, alternates, jsonLd } from "@/lib/site";
import { href, locales, projectHref, type Locale } from "@/lib/i18n";
import { getCopy, getProject, getProjects, getWaLinks } from "@/content";
import Tile from "@/components/Tile";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { ArrowIcon, WaIcon } from "@/components/Icons";

type Props = { params: Promise<{ lang: Locale; slug: string }> };

// projects added in the Studio get their page on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  const c = await getCopy("common", lang);
  const cat = c.categories[p.category];
  return {
    title: `${p.title[lang]} · ${cat}`,
    description: p.description[lang] || `${p.title[lang]}: ${cat}, ${p.services[lang]}.`,
    alternates: alternates(lang, `/work/${p.slug}`),
    openGraph: { images: [{ url: p.image.startsWith("http") ? p.image : SITE_URL + p.image }] },
    // placeholder projects stay out of search results until the real work is in
    ...(p.real ? {} : { robots: { index: false, follow: true } }),
  };
}

const d = (s: string) => ({ ["--d" as string]: s });

export default async function ProjectPage({ params }: Props) {
  const { lang: locale, slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();
  const [c, w, wa, all] = await Promise.all([getCopy("common", locale), getCopy("work", locale), getWaLinks(), getProjects()]);
  const cat = c.categories[p.category];
  const title = p.title[locale];
  const waProject = p.real ? title : `${title} (${cat})`;

  // the next three projects, wrapping around, real ones first
  const at = all.findIndex((x) => x.slug === p.slug);
  const others = [...all.slice(at + 1), ...all.slice(0, at)];
  const more = [...others.filter((x) => x.real), ...others.filter((x) => !x.real)].slice(0, 3);

  const abs = (src: string) => (src.startsWith("http") ? src : SITE_URL + src);
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    url: `${SITE_URL}${projectHref(locale, p.slug)}`,
    image: [p.image, ...p.gallery].map(abs),
    genre: cat,
    ...(p.description[locale] ? { description: p.description[locale] } : {}),
    ...(p.year[locale] ? { dateCreated: p.year[locale] } : {}),
    creator: { "@id": `${SITE_URL}/#studio` },
    inLanguage: locale,
  };

  return (
    <>
      {p.real ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} /> : null}
      <main>
        <nav id="crumbs" aria-label={w.page.crumbs}>
          <div className="wrap">
            <ol>
              <li><Link href={href(locale, "work")}>{w.page.all}</Link></li>
              <li aria-current="page">{p.id}</li>
            </ol>
          </div>
        </nav>

        <section id="project" className="sec">
          <div className="wrap pj-grid">
            <div className={`pj-cover ${p.tone}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.real ? title : w.sheet.coverAltPh} fetchPriority="high" />
            </div>
            <div className="pj-info">
              <p className="eyebrow hx" style={d(".2s")}>{cat}</p>
              <h1 className="disp rough hx" style={d(".28s")}>{title}</h1>
              <dl className="pj-meta hx" style={d(".36s")}>
                <dt>{w.sheet.client}</dt><dd>{p.client[locale]}</dd>
                <dt>{w.sheet.year}</dt><dd>{p.year[locale]}</dd>
                <dt>{w.sheet.services}</dt><dd>{p.services[locale]}</dd>
              </dl>
              <p className="pj-desc hx" style={d(".44s")}>{p.description[locale]}</p>
              {p.real ? null : <span className="tag">{w.sheet.descPh}</span>}
              <div className="pj-actions hx" style={d(".52s")}>
                <a className="btn btn-red" data-track="project" href={wa.href("project", locale, { project: waProject })} target="_blank" rel="noopener"><WaIcon /> {w.sheet.cta}</a>
              </div>
            </div>
          </div>
          {p.gallery.length ? (
            <div className="wrap pj-gal">
              {p.gallery.map((g, k) => (
                <figure key={g + k} className={/white/.test(g) ? "art-ink" : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt={`${title}, ${p.real ? w.sheet.galleryAlt : w.sheet.galleryAltPh} ${k + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          ) : null}
        </section>

        {more.length ? (
          <section id="pj-more" className="sec">
            <div className="wrap">
              <div className="sec-head">
                <h2 className="disp h2 rough">{w.page.more}</h2>
                <Link className="link" href={href(locale, "work")}>{w.page.moreAll} <ArrowIcon /></Link>
              </div>
              <div className="pj-more-grid">
                {more.map((x) => <Tile key={x.id} w={x} locale={locale} c={c} href={projectHref(locale, x.slug)} />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <CtaBand locale={locale} c={c} title={w.ctaTitle} sub={w.ctaSub} />
      <Footer locale={locale} c={c} current="work" />
    </>
  );
}
