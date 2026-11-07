"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Staggered entrances on scroll. Every section after the page's first screen reveals its
 * heading first, then its items one by one; the CSS animations inside a section
 * (process line, SOLD stamps, marquee, waving pennant) wait until it is in view.
 */
const ITEMS = [
  ".sec-head", ".svc-list > li", ".tk-grid:not(#tk-list) > *", "#work-row > *", ".steps > li",
  ".quotes > *", "#clients-head", "#clients-strip", "#cta-copy > *", "#cta-art", ".bubble",
  "#contact-list > li", "#footer-grid > *", "#footer-bottom",
  // grids that animate their own items when filtered: reveal them as one block
  "#proj-grid", "#tk-list", ".how-buy > *", "#more .tk-grid > *",
].join(",");

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("js-rv");

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section, main > div > section, #footer")).slice(1);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          // reveal this one and anything above it (a fast fling can skip a section)
          const idx = sections.indexOf(e.target as HTMLElement);
          for (const s of sections.slice(0, idx + 1)) {
            if (s.classList.contains("in-view")) continue;
            s.classList.add("in-view");
            io.unobserve(s);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    for (const s of sections) {
      if (s.classList.contains("rv-sec")) continue;
      s.classList.add("rv-sec");
      let i = 0;
      s.querySelectorAll<HTMLElement>(ITEMS).forEach((el) => {
        if (el.closest(".rv") ) return; // parent already reveals as a block
        el.classList.add("rv");
        el.style.setProperty("--rv-i", String(Math.min(i++, 7)));
      });
      io.observe(s);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
