"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Squeegee swipe between pages: the navy ink pulls in from the left over the old page,
 * the route changes underneath, then the same pull carries on to the right and uncovers
 * the new page. One continuous left-to-right stroke, no hard cut.
 */
const EASE = "cubic-bezier(.65,0,.35,1)";
const IN_MS = 460;
const OUT_MS = 520;

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const waiting = useRef(false);
  const busy = useRef(false);
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    // transform-only animation: runs on the compositor, stays smooth while the next page renders
    const sweep = (phase: "in" | "out", ms: number) => {
      const el = root.current!;
      el.dataset.phase = phase;
      const kf = phase === "in"
        ? [{ transform: "translate3d(-100%,0,0)" }, { transform: "translate3d(0,0,0)" }]
        : [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(100%,0,0)" }];
      return ink.current!.animate(kf, { duration: ms, easing: EASE, fill: "forwards" }).finished;
    };

    const onClick = (e: MouseEvent) => {
      if (busy.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("hreflang")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Home has its own opening screen (the progress bar): no ink sweep on the way there
      if (/^\/(id|en)\/?$/.test(url.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      busy.current = true;
      root.current!.classList.add("on");
      sweep("in", IN_MS).then(() => {
        waiting.current = true;
        router.push(url.pathname + url.search + url.hash);
        // never leave the page covered if the route takes too long
        window.setTimeout(() => waiting.current && reveal(), 8000);
      });
    };

    const reveal = () => {
      waiting.current = false;
      sweep("out", OUT_MS).then(() => {
        root.current?.classList.remove("on");
        busy.current = false;
      });
    };
    revealRef.current = reveal;

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!waiting.current) return;
    // let the new page paint once before uncovering it
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => revealRef.current()); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [pathname]);

  return (
    <div id="pt" ref={root} aria-hidden="true">
      <div id="pt-ink" ref={ink}>
        <span className="pt-sq pt-sq-lead" />
        <span className="pt-sq pt-sq-trail" />
      </div>
    </div>
  );
}
