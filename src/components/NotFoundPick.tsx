"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { localeOf } from "@/lib/i18n";

/**
 * The 404 page is rendered once for both languages and picks one from the URL here.
 * Reading the language on the server (headers()) would make every page under [lang]
 * dynamic, because Next renders the not-found boundary into each page's tree.
 */
export default function NotFoundPick({ id, en, titles }: { id: ReactNode; en: ReactNode; titles: { id: string; en: string } }) {
  const locale = localeOf(usePathname() ?? "/");
  return (
    <>
      <title>{titles[locale]}</title>
      {locale === "id" ? id : en}
    </>
  );
}
