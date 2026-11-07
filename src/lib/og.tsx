import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared pieces of the share cards (opengraph-image.tsx files). */
export const OG_SIZE = { width: 1200, height: 630 };
export const C = { ink: "#1C3C6D", deep: "#132B50", chalk: "#FBF5E8", paper: "#F4EEDF", red: "#B83A2E" };

export async function anton() {
  return { name: "Anton", data: await readFile(join(process.cwd(), "src/assets/fonts/Anton-Regular.ttf")), weight: 400 as const, style: "normal" as const };
}

/** A public/ file as a data URL (the card renders without fetching the site). */
export async function asset(src: string) {
  if (/^https?:/.test(src)) {
    // a Sanity image: ask for a PNG the card renderer can read
    const url = src.replace(/auto=format/, "fm=png").replace(/w=\d+/, "w=900");
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    return `data:image/png;base64,${buf.toString("base64")}`;
  }
  const buf = await readFile(join(process.cwd(), "public", src));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Halftone dots like the site's paper. */
export const dots = (color: string) => `radial-gradient(circle, ${color} 1.6px, transparent 2px)`;
