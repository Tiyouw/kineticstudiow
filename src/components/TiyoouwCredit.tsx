"use client";
import { useEffect, useRef, type ReactNode } from "react";
import TiyoouwMark from "./TiyoouwMark";

type MarkEl = HTMLElement & {
  play?: () => void; wake?: () => void; sleep?: () => void;
  _onMove?: (e: PointerEvent) => void;
};

const MOTIONS = ["snap", "hinge", "slide", "punch"] as const;
const EVERY = 4200; // ms between replays
const PEEK_EVERY = 3; // every 3rd beat the mark turns into eyes for a moment

/**
 * tiyoouw credit link with a living mark: while on screen it replays its entry motions in turn
 * and now and then peeks as eyes. Hovering the link (or tapping on touch) wakes the eyes,
 * which follow the pointer across the whole link; the loop pauses until the pointer leaves.
 */
export default function TiyoouwCredit({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  const link = useRef<HTMLAnchorElement>(null);
  const mark = useRef<MarkEl>(null);

  useEffect(() => {
    const a = link.current, el = mark.current;
    if (!a || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false, hovered = false, beat = 0, peekTimer = 0;

    const tick = () => {
      if (!visible || hovered || typeof el.play !== "function") return;
      beat++;
      if (beat % PEEK_EVERY === 0) {
        el.wake?.();
        a.classList.add("is-peek");
        peekTimer = window.setTimeout(() => { if (!hovered) { el.sleep?.(); a.classList.remove("is-peek"); } }, 1700);
      } else {
        el.setAttribute("motion", MOTIONS[beat % MOTIONS.length]);
        el.play();
      }
    };
    const loop = window.setInterval(tick, EVERY);

    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) window.setTimeout(tick, 400); // greet when it comes into view
    }, { threshold: 0.5 });
    io.observe(el);

    const enter = () => { hovered = true; window.clearTimeout(peekTimer); el.wake?.(); };
    const leave = () => { hovered = false; a.classList.remove("is-peek"); el.sleep?.(); };
    const move = (e: PointerEvent) => el._onMove?.(e);
    a.addEventListener("pointerenter", enter);
    a.addEventListener("pointerleave", leave);
    a.addEventListener("pointermove", move);
    a.addEventListener("focus", enter);
    a.addEventListener("blur", leave);

    return () => {
      window.clearInterval(loop); window.clearTimeout(peekTimer); io.disconnect();
      a.removeEventListener("pointerenter", enter); a.removeEventListener("pointerleave", leave);
      a.removeEventListener("pointermove", move); a.removeEventListener("focus", enter); a.removeEventListener("blur", leave);
    };
  }, []);

  return (
    <a ref={link} id={id} className={"tcredit " + (className ?? "")} href="https://tiyoouw.com" target="_blank" rel="noopener">
      <TiyoouwMark ref={mark as never} motion="snap" trigger="manual" label="tiyoouw" />
      {children}
    </a>
  );
}
