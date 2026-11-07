"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

export default function LangSwitch({ locale, label, id }: { locale: Locale; label: string; id?: string }) {
  const pathname = usePathname() || `/${locale}`;
  return (
    <div className="lang" id={id} role="group" aria-label={label}>
      {locales.map((l) => (
        <Link key={l} href={switchLocalePath(pathname, l)} hrefLang={l} aria-current={l === locale ? "true" : undefined} scroll={false}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
