import "@/styles/pages/work.css";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getCommon } from "@/i18n/common";
import { getWork } from "@/i18n/pages/work";
import { getProjects } from "@/content";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import WorkBrowser from "@/components/work/WorkBrowser";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getWork(lang).metaTitle, alternates: { canonical: `/${lang}/work` } };
}

export default async function WorkPage({ params }: Props) {
  const { lang: locale } = await params;
  const c = getCommon(locale);
  const w = getWork(locale);
  const projects = await getProjects();

  return (
    <>
      <main>
        <WorkBrowser projects={projects} locale={locale} c={c} w={w} />
        <CtaBand locale={locale} c={c} title={w.ctaTitle} sub={w.ctaSub} />
      </main>
      <Footer locale={locale} c={c} current="work" />
    </>
  );
}
