"use client";

import { useRef, useState } from "react";
import { CheckIcon } from "@/components/Icons";

type F = "all" | "available" | "sold";

/**
 * All / Available / Sold chips over the server-rendered tickets (passed as children).
 * Filtering toggles `hidden` on each .tk and replays its entrance (.in) and SOLD stamp, as in the canvas.
 */
export default function ShopFilter({ labels, aria, title, counts, children }: {
  labels: Record<F, string>;
  aria: string;
  title: string;
  counts: Record<F, string>;
  children: React.ReactNode;
}) {
  const [f, setF] = useState<F>("all");
  const [count, setCount] = useState(counts.all);
  const list = useRef<HTMLDivElement>(null);

  function pick(next: F) {
    setF(next);
    let n = 0;
    list.current?.querySelectorAll<HTMLElement>(".tk").forEach((t) => {
      const on = next === "all" || t.dataset.status === next;
      t.hidden = !on;
      t.classList.remove("in");
      if (!on) return;
      void t.offsetWidth;
      t.style.animationDelay = `${n * 45}ms`;
      t.classList.add("in");
      n++;
      const s = t.querySelector<HTMLElement>(".stamp");
      if (s) {
        s.style.animation = "none";
        void s.offsetWidth;
        s.style.animation = "";
        s.style.setProperty("--sd", `${n * 45 + 250}ms`);
      }
    });
    setCount(counts[next].replace("{n}", String(n)));
  }

  return (
    <>
      <div id="catalog-bar">
        <div>
          <h2 className="disp h2 rough">{title}</h2>
          <p id="catalog-count" aria-live="polite">{count}</p>
        </div>
        <div className="chips" id="filters" role="group" aria-label={aria}>
          {(["all", "available", "sold"] as F[]).map((k) => (
            <button key={k} type="button" className="chip" data-f={k} aria-pressed={f === k} onClick={() => pick(k)}>
              <CheckIcon />{labels[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="tk-grid" id="tk-list" ref={list}>{children}</div>
    </>
  );
}
