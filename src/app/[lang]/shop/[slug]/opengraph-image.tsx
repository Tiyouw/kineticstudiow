import { ImageResponse } from "next/og";
import { C, OG_SIZE, anton, asset, dots } from "@/lib/og";
import { prices, getProduct, getProducts } from "@/content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Kinetic Studiow premade mascot";

export async function generateStaticParams() {
  const products = await getProducts();
  return ["id", "en"].flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const id = lang === "id";
  const p = await getProduct(slug);
  const [font, art] = await Promise.all([anton(), asset(p?.image ?? "/assets/badge-full-filled.png")]);
  const sold = !!p?.sold;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.paper, backgroundImage: dots("rgba(28,60,109,.10)"), backgroundSize: "12px 12px", padding: 48, gap: 44, alignItems: "center", fontFamily: "Anton", color: C.ink }}>
        <div style={{ display: "flex", width: 500, height: 520, alignItems: "center", justifyContent: "center", background: C.chalk, border: `4px solid ${C.ink}`, boxShadow: `10px 10px 0 ${C.ink}`, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} width={420} height={420} alt="" style={{ objectFit: "contain", opacity: sold ? 0.55 : 1 }} />
          {sold && (
            <div style={{ position: "absolute", display: "flex", fontSize: 84, color: C.red, border: `7px solid ${C.red}`, padding: "4px 28px", transform: "rotate(-14deg)", letterSpacing: 4 }}>{id ? "TERJUAL" : "SOLD"}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: C.red }}>{id ? "MASKOT PREMADE" : "PREMADE MASCOT"} · #{p?.no ?? ""}</div>
          <div style={{ display: "flex", fontSize: 96, lineHeight: 1, marginTop: 14, textTransform: "uppercase" }}>{p?.name ?? "Kinetic Studiow"}</div>
          {p && <div style={{ display: "flex", fontSize: 54, marginTop: 26 }}>{prices(p, id ? "id" : "en").main}</div>}
          <div style={{ display: "flex", fontSize: 26, marginTop: 10, color: "#3B5680", letterSpacing: 1 }}>{id ? "Dijual sekali · Order via WhatsApp" : "Sold once · Order on WhatsApp"}</div>
          <div style={{ display: "flex", marginTop: 34, alignSelf: "flex-start", background: C.ink, color: C.chalk, fontSize: 28, letterSpacing: 2, padding: "10px 22px" }}>KINETICSTUDIOW.MY.ID</div>
        </div>
      </div>
    ),
    { ...size, fonts: [font] },
  );
}
