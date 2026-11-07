import type { CommonDict } from "@/i18n/common";
import TiyoouwMark from "./TiyoouwMark";

/** Opening screen, shown on every visit to Home: Kinetic × tiyoouw marks meet, counter 00→100, then the paper lifts away (CSS). */

export default function Loader({ c }: { c: CommonDict }) {
  return (
    <>
      <div id="loader" aria-hidden="true">
        <div id="ld-frame" />
        <div id="ld-collab">
          <img id="ld-kinetic" src="/assets/badge-full.png" alt="" />
          <svg id="ld-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M4 4 20 20" /><path d="M20 4 4 20" /></svg>
          <TiyoouwMark id="ld-tiyo" motion="snap" delay="360" />
        </div>
        <div id="ld-count"><small>%</small></div>
        <p id="ld-name" className="label">{c.loader.name}</p>
        <p id="ld-credit">{c.loader.credit} <b>tiyoouw.com</b></p>
      </div>
    </>
  );
}
