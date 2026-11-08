/** Pure helpers for the Studio's "Bagikan" panel: share links and captions trimmed to each platform's limit. */

export const X_LIMIT = 280;
export const X_URL_LEN = 23; // X counts every link as 23 characters
export const THREADS_LIMIT = 500;
export const DEFAULT_TAGS = "#mascotdesign #retrocartoon #characterdesign #illustration #kineticstudiow";

/** Cut text to `max` characters on a word boundary, with an ellipsis when cut. */
export function trimTo(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  if (max <= 1) return "…".slice(0, max);
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:–-]+$/, "") + "…";
}

/** X post text without the link (the link goes in &url=, counted as 23 plus a space). */
export const xText = (caption: string) => trimTo(caption, X_LIMIT - X_URL_LEN - 1);
/** The length X counts for text + space + link. */
export const xCount = (text: string) => text.length + 1 + X_URL_LEN;

/** Threads has no url parameter: the link goes at the end of the text, all within 500. */
export function threadsText(caption: string, url: string) {
  return `${trimTo(caption, THREADS_LIMIT - url.length - 2)}\n\n${url}`;
}

/** Instagram: links in captions don't click, so point to the bio. */
export function igText(caption: string, tags: string) {
  return [caption.trim(), "Link di bio.", tags.trim()].filter(Boolean).join("\n\n");
}

/** TikTok: captions up to 2200; links don't click there either, so point to the bio. */
export const TIKTOK_UPLOAD = "https://www.tiktok.com/tiktokstudio/upload";
export function tiktokText(caption: string, tags: string) {
  return trimTo([caption.trim(), "Link di bio.", tags.trim()].filter(Boolean).join("\n\n"), 2200);
}

const q = encodeURIComponent;

export function shareLinks(caption: string, url: string, image?: string) {
  return {
    x: `https://x.com/intent/post?text=${q(xText(caption))}&url=${q(url)}`,
    threads: `https://www.threads.net/intent/post?text=${q(threadsText(caption, url))}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${q(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${q(url)}`,
    whatsapp: `https://wa.me/?text=${q(`${caption.trim()}\n\n${url}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${q(url)}${image ? `&media=${q(image)}` : ""}&description=${q(trimTo(caption, 500))}`,
  };
}

/** A Sanity image reference (image-<hash>-<w>x<h>-<ext>) as a CDN URL, JPG at `w` wide; `download` makes it save as that file name. */
export function imageUrl(ref: string | undefined, projectId: string, dataset: string, w = 1440, download?: string) {
  const m = ref?.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
  if (!m) return undefined;
  const base = `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=${w}&fit=max&fm=jpg&q=90`;
  return download === undefined ? base : `${base}&dl=${q(download)}`;
}
