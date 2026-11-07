import type { Locale } from "@/lib/i18n";
import { getWaLinks } from "@/content";
import type { CommonDict } from "@/i18n/common";
import Bubble from "./Bubble";
import { WaIcon } from "./Icons";

export default async function CtaBand({ locale, c, title, sub, eyebrow }: {
  locale: Locale; c: CommonDict; title?: string; sub?: string; eyebrow?: string;
}) {
  const w = await getWaLinks();
  return (
    <section id="cta" className="band band-red on-red">
      <div className="band-ht" />
      <div className="wrap">
        <div id="cta-copy">
          <img id="cta-pennant" className="wave" src="/assets/pennant-flag-filled.png" alt="" />
          <p className="eyebrow">{eyebrow ?? c.cta.eyebrow}</p>
          <h2 id="cta-title" className="disp rough">{title ?? c.cta.title}</h2>
          <p id="cta-sub">{sub ?? c.cta.sub}</p>
          <a id="cta-btn" className="btn btn-cream" href={w.href("general", locale)} target="_blank" rel="noopener"><WaIcon /> {c.chatWa}</a>
          <Bubble text={w.text("general", locale)} head={c.bubble.opensWith} to={c.bubble.to} meta={c.bubble.meta} />
        </div>
        <div id="cta-side">
          <div id="cta-art"><img src="/assets/mascot-full-white.png" alt={c.cta.art} /></div>
        </div>
      </div>
    </section>
  );
}
