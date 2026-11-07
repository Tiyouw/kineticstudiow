import "@/styles/pages/work.css";
import type { Metadata } from "next";
import { alternates } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { getProjects, getCopy } from "@/content";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import WorkBrowser from "@/components/work/WorkBrowser";

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: (await getCopy("work", lang)).metaTitle, description: (await getCopy("work", lang)).lede, alternates: alternates(lang, "/work") };
}

export default async function WorkPage({ params }: Props) {
  const { lang: locale } = await params;
  const c = (await getCopy("common", locale));
  const w = (await getCopy("work", locale));
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
