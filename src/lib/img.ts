/**
 * Responsive <img> attributes. `sizes` is how wide the image shows on screen (CSS px);
 * the browser then fetches the smallest file that stays sharp on the device.
 *
 * - Brand PNGs in /assets have WebP twins: x.webp (full size) and x-450.webp.
 *   The PNGs stay for share cards and JSON-LD, which need PNG.
 * - Sanity images are resized by its CDN (w=..., auto=format already gives WebP/AVIF).
 *
 * Keep `sizes` at least as wide as the image ever renders: images without a CSS width
 * take their layout width from it.
 */
export function img(src: string, sizes: string): { src: string; srcSet?: string; sizes?: string } {
  if (src.startsWith("/assets/") && src.endsWith(".png")) {
    const base = src.slice(0, -4);
    return { src: `${base}.webp`, srcSet: `${base}-450.webp 450w, ${base}.webp 900w`, sizes };
  }
  if (src.includes("cdn.sanity.io/images/")) {
    const at = (w: number) => (/[?&]w=\d+/.test(src) ? src.replace(/([?&])w=\d+/, `$1w=${w}`) : `${src}${src.includes("?") ? "&" : "?"}w=${w}`);
    // Sanity never upscales (fit=max), so the widths offered stop at the original's,
    // which its file name carries: ...-900x814.png
    const orig = Number(src.match(/-(\d+)x\d+\.\w+(?:\?|$)/)?.[1]) || 1600;
    const widths = [400, 800, 1200, 1600].filter((w) => w < orig).concat(Math.min(orig, 1600));
    return { src: at(Math.min(800, orig)), srcSet: widths.map((w) => `${at(w)} ${w}w`).join(", "), sizes };
  }
  return { src };
}
