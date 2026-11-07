import "./q.css";
import type { Metadata, Viewport } from "next";
import { Anton, Barlow } from "next/font/google";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const barlow = Barlow({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = { title: "Pertanyaan untuk Fatwa · Kinetic Studiow", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#1C3C6D" };

/** Fatwa's questionnaire has its own root layout: none of the site's chrome. */
export default function QLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${anton.variable} ${barlow.variable}`}>
      <body className="qz">{children}</body>
    </html>
  );
}
