import "@/styles/pages/journal.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { SITE_URL, alternates, jsonLd } from "@/lib/site";
import { locales, productHref, projectHref, type Locale } from "@/lib/i18n";
import { getCopy, getPost, getPosts } from "@/content";
import PostCard, { postDate, postHref } from "@/components/journal/PostCard";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { ArrowIcon } from "@/components/Icons";

type Props = { params: Promise<{ lang: Locale; slug: string }> };

// posts published in the Studio get their page on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return locales.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })));
}

const abs = (src: string) => (src.startsWith("http") ? src : SITE_URL + src);

/** Plain text of a post for descriptions: the caption, else the start of the body. */
function summary(p: NonNullable<Awaited<ReturnType<typeof getPost>>>, locale: Locale) {
  if (p.caption) return p.caption.slice(0, 160);
  const blocks = p.body[locale].length ? p.body[locale] : p.body.en;
  const text = blocks
    .flatMap((b) => ((b as { children?: { text?: string }[] }).children ?? []).map((c) => c.text ?? ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, "") + "…" : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: p.title[lang],
    description: summary(p, lang),
    alternates: alternates(lang, `/journal/${p.slug}`),
    openGraph: { type: "article", publishedTime: p.publishedAt, images: [{ url: abs(p.cover) }] },
  };
}

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL);
      return <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>{children}</a>;
    },
  },
};

const d = (s: string) => ({ ["--d" as string]: s });

export default async function PostPage({ params }: Props) {
  const { lang: locale, slug } = await params;
  const p = await getPost(slug);
  if (!p) notFound();
  const [c, t, all] = await Promise.all([getCopy("common", locale), getCopy("journal", locale), getPosts()]);
  const title = p.title[locale];
  const body = p.body[locale].length ? p.body[locale] : p.body.en;
  const more = all.filter((x) => x.slug !== p.slug).slice(0, 3);
  const rel = p.related;
  const relHref = rel ? (rel.kind === "product" ? productHref(locale, rel.slug) : projectHref(locale, rel.slug)) : "";

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    url: `${SITE_URL}${postHref(locale, p.slug)}`,
    image: [p.cover, ...p.gallery].map(abs),
    datePublished: p.publishedAt,
    description: summary(p, locale),
    inLanguage: locale,
    author: { "@id": `${SITE_URL}/#studio` },
    publisher: { "@id": `${SITE_URL}/#studio` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <main>
        <nav id="crumbs" aria-label={t.crumbs}>
          <div className="wrap">
            <ol>
              <li><Link href={`/${locale}/journal`}>{t.all}</Link></li>
              <li aria-current="page"><time dateTime={p.publishedAt}>{postDate(p.publishedAt, locale)}</time></li>
            </ol>
          </div>
        </nav>

        <article id="post" className="sec">
          <div className="wrap jr-post">
            <header className="jr-head">
              <p className="eyebrow hx" style={d(".2s")}><time dateTime={p.publishedAt}>{postDate(p.publishedAt, locale)}</time></p>
              <h1 className="disp rough hx" style={d(".28s")}>{title}</h1>
            </header>
            <div className="jr-cover hx" style={d(".36s")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover} alt={title} fetchPriority="high" />
            </div>
            {body.length ? <div className="jr-body"><PortableText value={body as never} components={components} /></div> : null}
            {p.gallery.length ? (
              <div className="jr-gal">
                {p.gallery.map((g, k) => (
                  <figure key={g + k}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt={`${title}, ${k + 1}`} loading="lazy" />
                  </figure>
                ))}
              </div>
            ) : null}
            {rel ? (
              <aside className="jr-related" aria-label={t.related}>
                <p className="eyebrow">{t.related}</p>
                <Link className="tile jr-rel" href={relHref}>
                  {rel.image ? (
                    <div className="tile-art">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rel.image} alt={rel.name[locale] || rel.name.en} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="tile-cap">
                    <strong>{rel.name[locale] || rel.name.en}</strong>
                    <span>{rel.kind === "product" ? t.seeProduct : t.seeProject} <ArrowIcon /></span>
                  </div>
                </Link>
              </aside>
            ) : null}
          </div>
        </article>

        {more.length ? (
          <section id="jr-more" className="sec">
            <div className="wrap">
              <div className="sec-head jr-more-head">
                <h2 className="disp h2 rough">{t.more}</h2>
                <Link className="link" href={`/${locale}/journal`}>{t.all} <ArrowIcon /></Link>
              </div>
              <div className="jr-grid jr-grid-more">
                {more.map((x) => <PostCard key={x.slug} p={x} locale={locale} lazy />)}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <CtaBand locale={locale} c={c} title={t.ctaTitle} sub={t.ctaSub} />
      <Footer locale={locale} c={c} />
    </>
  );
}
