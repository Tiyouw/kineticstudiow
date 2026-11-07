"use client";
/* eslint-disable @next/next/no-img-element -- assets are pre-sized; plain <img> per the site brief */

import { useState } from "react";
import type { ArtTone } from "@/content";
import { img } from "@/lib/img";

export interface View { src: string; tone: ArtTone; label: string; alt: string; aria: string }

/** Product gallery: thumbnails crossfade the stacked main images (.pm-layer.on). */
export default function Gallery({ views, no, ph, aria, stamp }: {
  views: View[]; no: string; ph?: string; aria: string; stamp?: string;
}) {
  const [v, setV] = useState(0);
  return (
    <div id="gallery" className="hx" style={{ ["--d" as string]: ".55s" }}>
      <div id="pm">
        {views.map((x, i) => (
          <div key={i} className={`pm-layer ${x.tone}${i === v ? " on" : ""}`} aria-hidden={i !== v}>
            <img {...img(x.src, "(min-width: 1024px) 440px, 70vw")} alt={x.alt} fetchPriority={i === 0 ? "high" : undefined} loading={i === 0 ? undefined : "lazy"} />
          </div>
        ))}
        <span id="pm-tag">#{no}</span>
        {ph ? <span className="tk-ph">{ph}</span> : null}
        {stamp ? <span className="stamp" style={{ ["--sd" as string]: "1.1s" }}>{stamp}</span> : null}
      </div>
      {views.length > 1 ? (
        <div id="thumbs" role="group" aria-label={aria} style={{ gridTemplateColumns: `repeat(${Math.min(views.length, 4)},1fr)` }}>
          {views.map((x, i) => (
            <button key={i} type="button" className="thumb" aria-pressed={i === v} aria-label={x.aria} onClick={() => setV(i)}>
              <span className={`tb ${x.tone}`}><img src={x.src} alt={x.alt} /></span>
              {x.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
