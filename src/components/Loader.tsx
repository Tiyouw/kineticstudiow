import type { CommonDict } from "@/i18n/common";
import TiyoouwMark from "./TiyoouwMark";
import IntroDone from "./IntroDone";

/**
 * Opening screen on Home: Kinetic × tiyoouw marks meet, counter 00→100, then the paper lifts away (CSS).
 * Plays once per browser session; the inline script hides it before paint on later visits
 * and tells the hero not to wait for it (.skip-intro).
 */
const once = `(function(){try{var k='kinetic-intro';if(sessionStorage.getItem(k)){document.documentElement.classList.add('skip-intro');}else{sessionStorage.setItem(k,'1');}}catch(e){}})();`;

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
      <script dangerouslySetInnerHTML={{ __html: once }} />
      <IntroDone />
    </>
  );
}
