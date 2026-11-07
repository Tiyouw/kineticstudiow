"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, type Locale, type PageKey } from "@/lib/i18n";
import { useWa } from "@/components/WaProvider";
import type { CommonDict } from "@/i18n/common";
import LangSwitch from "./LangSwitch";
import { CloseIcon, MenuIcon, WaIcon } from "./Icons";

const ITEMS: PageKey[] = ["home", "work", "shop", "custom", "about"];

/** The nav item for a path, or null on paths that aren't a site page (the 404). */
export function currentPage(pathname: string): PageKey | null {
  const parts = pathname.split("/").filter(Boolean);
  const seg = parts[1] ?? "";
  if (seg === "") return "home";
  if (seg === "shop") return "shop";
  if (parts.length > 2) return null;
  if (seg === "work") return "work";
  if (seg === "custom-order") return "custom";
  if (seg === "about") return "about";
  return null;
}

export default function Nav({ locale, c }: { locale: Locale; c: CommonDict }) {
  const pathname = usePathname() || "";
  const page = currentPage(pathname);
  const wa_ = useWa();
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState(false); // compact bar, shown when scrolling up past the first screen
  const [past, setPast] = useState(false); // past the first screen: back-to-top shows
  useEffect(() => setOpen(false), [pathname]);

  // headroom: hide while reading down, show the quick nav on a small scroll up
  useEffect(() => {
    let lastY = window.scrollY, upBy = 0, raf = 0;
    const firstScreen = () => {
      const first = document.querySelector("main > section, main > div > section") as HTMLElement | null;
      return Math.max(480, first ? first.offsetTop + first.offsetHeight - 80 : window.innerHeight);
    };
    let limit = firstScreen();
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY, dy = y - lastY;
        lastY = y;
        const isPast = y > limit;
        setPast(isPast);
        if (!isPast) { upBy = 0; setQuick(false); return; }
        if (dy > 0) { upBy = 0; setQuick(false); }
        else if (dy < 0) { upBy -= dy; if (upBy > 24) setQuick(true); }
      });
    };
    const onResize = () => { limit = firstScreen(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(onResize, 600);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); window.clearTimeout(t); cancelAnimationFrame(raf); };
  }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const cur = (k: PageKey) => (page === k ? ({ "aria-current": "page" } as const) : {});
  const wa = wa_.href("general", locale);

  return (
    <header id="nav">
      <Link id="nav-logo" href={href(locale, "home")} aria-label={c.homeLabel}>
        <img src="/assets/wordmark-script.png" alt="Kinetic Studiow" />
      </Link>
      <nav id="nav-links" aria-label="Main">
        {ITEMS.map((k, i) => (
          <Link key={k} href={href(locale, k)} {...cur(k)}><span>0{i + 1}</span>{c.nav[k]}</Link>
        ))}
      </nav>
      <div id="nav-actions">
        <LangSwitch locale={locale} label={c.language} id="nav-lang" />
        <a id="nav-wa" className="btn btn-red" href={wa} target="_blank" rel="noopener"><WaIcon /> {c.whatsapp}</a>
        <button id="nav-menu-btn" type="button" aria-label={c.openMenu} aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
          <MenuIcon />
        </button>
      </div>
      <nav id="menu" className={"on-ink" + (open ? " open" : "")} aria-label="Main" aria-hidden={!open} inert={!open}>
        <div className="band-ht" />
        <div id="menu-head">
          <Link href={href(locale, "home")} aria-label={c.homeLabel}><img src="/assets/wordmark-script-white.png" alt="Kinetic Studiow" /></Link>
          <button id="menu-close" type="button" aria-label={c.closeMenu} onClick={() => setOpen(false)}><CloseIcon /></button>
        </div>
        <ul id="menu-links">
          {ITEMS.map((k, i) => (
            <li key={k}>
              <Link href={href(locale, k)} style={{ ["--i" as string]: i }} {...cur(k)}>
                {c.nav[k]} <small>{page === k ? c.youAreHere : `0${i + 1}`}</small>
              </Link>
            </li>
          ))}
        </ul>
        <div id="menu-foot">
          <a className="btn btn-red" href={wa} target="_blank" rel="noopener"><WaIcon /> {c.chatWa}</a>
          <LangSwitch locale={locale} label={c.language} />
          <p>{c.menuFoot}</p>
        </div>
      </nav>

      <div id="quicknav" className={quick && !open ? "show" : undefined} aria-hidden={!quick} inert={!quick}>
        <div className="qn-in">
          <Link className="qn-logo" href={href(locale, "home")} aria-label={c.homeLabel}>
            <img src="/assets/wordmark-script.png" alt="Kinetic Studiow" />
          </Link>
          <nav className="qn-links" aria-label="Quick">
            {ITEMS.map((k, i) => (
              <Link key={k} href={href(locale, k)} {...cur(k)}><span>0{i + 1}</span>{c.nav[k]}</Link>
            ))}
          </nav>
          <div className="qn-actions">
            <LangSwitch locale={locale} label={c.language} />
            <a className="btn btn-red qn-wa" href={wa} target="_blank" rel="noopener"><WaIcon /> {c.whatsapp}</a>
            <button className="qn-menu" type="button" aria-label={c.openMenu} aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <button id="to-top" type="button" className={past ? "show" : undefined} aria-label={c.toTop} tabIndex={past ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
      </button>
    </header>
  );
}
