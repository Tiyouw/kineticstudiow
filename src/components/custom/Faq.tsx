"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/Icons";

/** Accordion: each question is a button that opens its answer region. */
export default function Faq({ items, tag, idPrefix = "qa" }: { items: { q: string; a: string }[]; tag?: string; idPrefix?: string }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <div id={idPrefix === "qa" ? "faq-list" : undefined} className="faq-list">
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div key={i} className={"qa" + (on ? " open" : "")} id={`${idPrefix}-${i}`}>
            <h3>
              <button type="button" id={`${idPrefix}-q-${i}`} aria-expanded={on} aria-controls={`${idPrefix}-a-${i}`} onClick={() => toggle(i)}>
                {it.q}<ChevronIcon />
              </button>
            </h3>
            <div className="qa-a" id={`${idPrefix}-a-${i}`} role="region" aria-labelledby={`${idPrefix}-q-${i}`} inert={!on}>
              <div><p>{it.a}</p>{tag ? <span className="tag">{tag}</span> : null}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
