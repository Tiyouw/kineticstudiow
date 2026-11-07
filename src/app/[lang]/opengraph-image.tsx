import { ImageResponse } from "next/og";
import { C, OG_SIZE, anton, asset, dots } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Kinetic Studiow";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const id = lang === "id";
  const [font, badge] = await Promise.all([anton(), asset("/assets/badge-full-filled.png")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.ink, backgroundImage: dots("rgba(251,245,232,.10)"), backgroundSize: "12px 12px", padding: 56, gap: 48, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, color: C.chalk }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#F09A8E", fontFamily: "Anton" }}>{id ? "JEMBER · JAWA TIMUR" : "JEMBER · EAST JAVA"}</div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Anton", fontSize: 92, lineHeight: 1, marginTop: 18, textTransform: "uppercase" }}>
            <span>{id ? "Maskot retro" : "Retro mascots"}</span>
            <span>{id ? "untuk brand" : "for brands"}</span>
            <span style={{ color: C.red, textShadow: `4px 4px 0 ${C.chalk}` }}>{id ? "berkarakter" : "with character"}</span>
          </div>
          <div style={{ display: "flex", marginTop: 34, alignSelf: "flex-start", background: C.red, color: C.chalk, fontFamily: "Anton", fontSize: 30, letterSpacing: 2, padding: "12px 26px", border: `3px solid ${C.chalk}`, boxShadow: `6px 6px 0 ${C.deep}` }}>
            KINETICSTUDIOW.MY.ID
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badge} width={420} height={466} alt="" style={{ transform: "rotate(-4deg)" }} />
      </div>
    ),
    { ...size, fonts: [font] },
  );
}
