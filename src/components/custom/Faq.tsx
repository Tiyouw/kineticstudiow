"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/Icons";

/** Accordion: each question is a button that opens its answer region. */
export default function Faq({ items, tag }: { items: { q: string; a: string }[]; tag: string }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <div id="faq-list">
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div key={i} className={"qa" + (on ? " open" : "")} id={`qa-${i}`}>
            <h3>
              <button type="button" id={`qa-q-${i}`} aria-expanded={on} aria-controls={`qa-a-${i}`} onClick={() => toggle(i)}>
                {it.q}<ChevronIcon />
              </button>
            </h3>
            <div className="qa-a" id={`qa-a-${i}`} role="region" aria-labelledby={`qa-q-${i}`} inert={!on}>
              <div><p>{it.a}</p><span className="tag">{tag}</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
