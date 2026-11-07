import type { Metadata, Viewport } from "next";
import { getCopy, getWa } from "@/content";
import WaProvider from "@/components/WaProvider";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Anton, Barlow } from "next/font/google";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import Nav from "@/components/Nav";
import WaFloat from "@/components/WaFloat";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import LangSwap from "@/components/LangSwap";
import "@/styles/kinetic.css";
import "@/styles/site.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const barlow = Barlow({ weight: ["400", "500", "600", "700", "800"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const id = lang === "id";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Kinetic Studiow", template: "%s · Kinetic Studiow" },
    description: id
      ? "Maskot kartun retro dan branding, digambar tangan di Jember, Jawa Timur. Order lewat WhatsApp."
      : "Custom retro cartoon mascots and branding, hand-drawn in Indonesia for brands worldwide. Premade mascots or commissions.",
    keywords: id
      ? ["desain maskot", "jasa maskot", "ilustrasi retro", "maskot brand", "logo vintage", "lettering", "desain merch", "ilustrator Jember", "Kinetic Studiow"]
      : ["custom mascot design", "mascot commission", "brand mascot", "retro cartoon mascot", "premade mascot", "character design", "cartoon logo", "vintage logo", "custom lettering", "merch graphics", "mascot illustrator", "Kinetic Studiow"],
    openGraph: { type: "website", siteName: "Kinetic Studiow", locale: id ? "id_ID" : "en_US", alternateLocale: id ? "en_US" : "id_ID" },
    twitter: { card: "summary_large_image" },
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
    icons: { icon: "/assets/mascot-head-circle-filled.png" },
  };
}

export const viewport: Viewport = { themeColor: "#1C3C6D" };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const [c, wa, draft] = await Promise.all([getCopy("common", locale), getWa(), draftMode().then((d) => d.isEnabled)]);
  return (
    <html lang={locale} className={`${anton.variable} ${barlow.variable}`} suppressHydrationWarning>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={7} /><feDisplacementMap in="SourceGraphic" scale={1.6} /></filter>
        </svg>
        <WaProvider cfg={wa}>
        <div id="page">
          <Nav locale={locale} c={c} />
          {children}
          <WaFloat locale={locale} label={c.waFloat} />
        </div>
        </WaProvider>
        <PageTransition />
        <LangSwap />
        <ScrollReveal />
        <Script src="/tiyoouw-mark.js" strategy="beforeInteractive" />
        <Analytics />
        {draft ? (
          <>
            {/* Pratinjau in the Studio: refreshes on every edit; the link leaves draft mode */}
            <VisualEditing />
            <a id="draft-exit" href={`/api/draft-mode/disable?to=/${locale}`}>Keluar pratinjau</a>
          </>
        ) : null}
      </body>
    </html>
  );
}
