import Link from "next/link";
import { getWaLinks } from "@/content";
import { href, type Locale, type PageKey } from "@/lib/i18n";
import type { CommonDict } from "@/i18n/common";
import LangSwitch from "./LangSwitch";
import TiyoouwCredit from "./TiyoouwCredit";
import { BehanceIcon, InstagramIcon, MailIcon, WaIcon } from "./Icons";

const PAGES: PageKey[] = ["home", "work", "shop", "custom", "about"];

export default async function Footer({ locale, c, current }: { locale: Locale; c: CommonDict; current?: PageKey }) {
  const w = await getWaLinks();
  const f = c.footer;
  return (
    <footer id="footer">
      <div id="footer-grid">
        <div id="footer-brand">
          <img className="only-d" src="/assets/badge-full.png" alt={f.badgeAlt} />
          <img className="only-m" src="/assets/mascot-head-circle.png" alt="Kinetic Studiow" />
          <p className="only-d">{f.blurb}</p>
        </div>
        <div id="footer-say">
          <p className="eyebrow only-d">{f.sayHello}</p>
          <ul className="f-links">
            <li><a href="https://instagram.com/kinetic.studiow" target="_blank" rel="noopener"><InstagramIcon /> Instagram<span>@kinetic.studiow</span></a></li>
            <li><a href="https://behance.net/kineticstd" target="_blank" rel="noopener"><BehanceIcon /> Behance<span>kineticstd</span></a></li>
            <li><a href="mailto:kineticcreative666@gmail.com"><MailIcon /> {f.email}<span>kineticcreative666@gmail.com</span></a></li>
            <li><a href={w.href("general", locale)} target="_blank" rel="noopener"><WaIcon /> WhatsApp<span>{f.chatToOrder}</span></a></li>
          </ul>
        </div>
        <div id="footer-site">
          <p className="eyebrow only-d">{f.theSite}</p>
          <ul id="footer-pages">
            {PAGES.map((k) => (
              <li key={k}><Link href={href(locale, k)} aria-current={current === k ? "page" : undefined}>{c.nav[k]}</Link></li>
            ))}
          </ul>
          <div className="f-lang"><LangSwitch locale={locale} label={c.language} id="footer-lang" /></div>
        </div>
      </div>
      <div id="footer-bottom">
        <p>
          {f.copyright} · {f.websiteBy}{" "}
          <TiyoouwCredit className="f-tiyo"><span>tiyoouw.com</span></TiyoouwCredit>
        </p>
        <p className="label" style={{ fontSize: 11 }}>{f.place}</p>
      </div>
    </footer>
  );
}
