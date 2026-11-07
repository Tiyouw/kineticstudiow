import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Anton, Barlow } from "next/font/google";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { getCommon } from "@/i18n/common";
import Nav from "@/components/Nav";
import WaFloat from "@/components/WaFloat";
import PageTransition from "@/components/PageTransition";
import "@/styles/kinetic.css";
import "@/styles/site.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const barlow = Barlow({ weight: ["400", "500", "600", "700", "800"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kineticstudiow.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const id = lang === "id";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Kinetic Studiow", template: "%s · Kinetic Studiow" },
    description: id
      ? "Maskot kartun retro dan branding, digambar tangan di Jember, Jawa Timur. Order lewat WhatsApp."
      : "Retro cartoon mascots and branding, hand-drawn in Jember, East Java. Order on WhatsApp.",
    alternates: { languages: { id: "/id", en: "/en" } },
    openGraph: { siteName: "Kinetic Studiow", images: ["/assets/badge-full-filled.png"], locale: id ? "id_ID" : "en_US" },
    icons: { icon: "/assets/mascot-head-circle-filled.png" },
  };
}

export const viewport: Viewport = { themeColor: "#1C3C6D" };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const c = getCommon(locale);
  return (
    <html lang={locale} className={`${anton.variable} ${barlow.variable}`} suppressHydrationWarning>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={7} /><feDisplacementMap in="SourceGraphic" scale={1.6} /></filter>
        </svg>
        <div id="page">
          <Nav locale={locale} c={c} />
          {children}
          <WaFloat locale={locale} label={c.waFloat} />
        </div>
        <PageTransition />
        <Script src="/tiyoouw-mark.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
