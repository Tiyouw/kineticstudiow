"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, type Locale, type PageKey } from "@/lib/i18n";
import { waHref } from "@/lib/whatsapp";
import type { CommonDict } from "@/i18n/common";
import LangSwitch from "./LangSwitch";
import { CloseIcon, MenuIcon, WaIcon } from "./Icons";

const ITEMS: Exclude<PageKey, "home">[] = ["work", "shop", "custom", "about"];

export function currentPage(pathname: string): PageKey {
  const seg = pathname.split("/")[2] ?? "";
  if (seg === "work") return "work";
  if (seg === "shop") return "shop";
  if (seg === "custom-order") return "custom";
  if (seg === "about") return "about";
  return "home";
}

export default function Nav({ locale, c }: { locale: Locale; c: CommonDict }) {
  const pathname = usePathname() || "";
  const page = currentPage(pathname);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const cur = (k: PageKey) => (page === k ? ({ "aria-current": "page" } as const) : {});
  const wa = waHref("general", locale);

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
    </header>
  );
}
