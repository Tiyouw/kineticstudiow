"use client";
/* eslint-disable @next/next/no-img-element -- assets are pre-sized brand PNGs, plain <img> per the site brief */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { waHref } from "@/lib/whatsapp";
import type { Project, WorkCategory } from "@/content/types";
import type { CommonDict } from "@/i18n/common";
import type { WorkDict } from "@/i18n/pages/work";
import { TileInner } from "@/components/Tile";
import { CheckIcon, CloseIcon, WaIcon } from "@/components/Icons";

type Filter = "all" | WorkCategory;
const FILTERS: Filter[] = ["all", "mascot", "brand", "lettering", "merch"];

const d = (s: string) => ({ ["--d" as string]: s });

/** Layout slots from the design: tile 01 is the big one (wide on mobile), tile 06 is wide. */
const sizeOf = (i: number) => (i === 0 ? " big" : i === 5 ? " wide" : "");

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Work page header with the filter chips, the project grid and the project sheet/modal. */
export default function WorkBrowser({ projects, locale, c, w }: {
  projects: Project[]; locale: Locale; c: CommonDict; w: WorkDict;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [run, setRun] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [shown, setShown] = useState(0); // last opened project, kept while the sheet animates out
  const lastTile = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isOpen = openIdx !== null;

  const pick = (f: Filter) => { setFilter(f); setRun((r) => r + 1); };

  const close = useCallback(() => {
    setOpenIdx(null);
    lastTile.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const els = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, close]);

  const p = projects[shown];
  const cat = c.categories[p.category];
  const waProject = p.real ? p.title[locale] : `${p.title[locale]} (${cat})`;
  let n = 0;

  return (
    <>
      <section id="work-head" className="band on-ink ph-band">
        <div className="band-ht" />
        <div className="wrap">
          <div className="strip">{w.strip.map((s) => <p key={s} className="label">{s}</p>)}</div>
          <div className="phead">
            <p className="eyebrow hx" style={d(".6s")}>{w.eyebrow}</p>
            <h1 className="disp rough">
              {w.title.map((l, i) => (
                <span key={l}>{i > 0 ? " " : null}<span className="ln hx" style={d(`${(0.65 + i * 0.08).toFixed(2)}s`)}>{l}</span></span>
              ))}
            </h1>
            <p className="lede hx" style={d(".85s")}>{w.lede}</p>
            <div className="filters hx" style={d(".95s")} id="filters" role="group" aria-label={w.filterAria}>
              <span className="label">{w.filterBy}</span>
              <div className="chips">
                {FILTERS.map((f) => (
                  <button key={f} type="button" className="chip" data-f={f} aria-pressed={filter === f} onClick={() => pick(f)}>
                    <CheckIcon />{c.categories[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="sec">
        <div className="wrap">
          <div id="proj-grid" className={filter !== "all" ? "is-filtered" : undefined}>
            {projects.map((pr, i) => {
              const on = filter === "all" || pr.category === filter;
              const k = on ? n++ : 0;
              return (
                <button
                  key={on ? `${pr.id}-${run}` : pr.id}
                  type="button"
                  className={"tile" + sizeOf(i) + (on && run > 0 ? " in" : "")}
                  id={`work-${pr.id}`}
                  data-cat={pr.category}
                  hidden={!on}
                  style={on && run > 0 ? { animationDelay: `${k * 40}ms` } : undefined}
                  aria-haspopup="dialog"
                  onClick={(e) => { lastTile.current = e.currentTarget; setShown(i); setOpenIdx(i); }}
                >
                  <TileInner w={pr} locale={locale} c={c} />
                </button>
              );
            })}
          </div>
          <p id="proj-empty" hidden={n > 0}>{w.empty}</p>
        </div>
      </section>

      <div
        id="sheet"
        className={isOpen ? "open" : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div id="sheet-bg" onClick={close} />
        <div id="sheet-panel" ref={panel}>
          <div id="sheet-grip" aria-hidden="true" />
          <button id="sheet-close" ref={closeBtn} type="button" aria-label={w.sheet.close} onClick={close}><CloseIcon /></button>
          <div id="sheet-cover" className={p.tone || undefined}>
            <img src={p.image} alt={p.real ? p.title[locale] : w.sheet.coverAltPh} />
          </div>
          <div id="sheet-info">
            <p className="eyebrow" id="sheet-cat">{cat}</p>
            <h2 id="sheet-title" className="disp rough">{p.title[locale]}</h2>
            <dl id="sheet-meta">
              <dt>{w.sheet.client}</dt><dd id="sheet-client">{p.client[locale]}</dd>
              <dt>{w.sheet.year}</dt><dd id="sheet-year">{p.year[locale]}</dd>
              <dt>{w.sheet.services}</dt><dd id="sheet-svc">{p.services[locale]}</dd>
            </dl>
            <p id="sheet-desc">{p.description[locale]}</p>
            {p.real ? null : <span className="tag" id="sheet-ph">{w.sheet.descPh}</span>}
            <a className="btn btn-red" id="sheet-cta" href={waHref("project", locale, { project: waProject })} target="_blank" rel="noopener">
              <WaIcon /> {w.sheet.cta}
            </a>
          </div>
          <div id="sheet-gal">
            {p.gallery.slice(0, 3).map((g, k) => (
              <div key={`${shown}-${k}`} className={/white/.test(g) ? "art-ink" : undefined}>
                <img src={g} alt={`${p.real ? w.sheet.galleryAlt : w.sheet.galleryAltPh} ${k + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
