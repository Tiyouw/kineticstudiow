"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Switching ID/EN re-renders the page in the other language. That must feel like the text
 * changing in place, not a new visit: no ink sweep (PageTransition skips hreflang links),
 * same scroll position, and every entrance shown at its end state (html.no-anim).
 * The next ordinary navigation turns entrances back on.
 */
const KEY = "kinetic-langswap";

export default function LangSwap() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const html = document.documentElement;
      if (a.hasAttribute("hreflang")) {
        html.classList.add("no-anim");
        try { sessionStorage.setItem(KEY, String(window.scrollY)); } catch {}
      } else if (new URL(a.href, location.href).origin === location.origin) {
        html.classList.remove("no-anim");
      }
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    let y: string | null = null;
    try { y = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch {}
    if (y === null) return;
    document.documentElement.classList.add("no-anim");
    const top = Number(y);
    if (Math.abs(window.scrollY - top) > 2) requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }));
  }, [pathname]);

  return null;
}
