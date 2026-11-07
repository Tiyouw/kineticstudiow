"use client";
import { createContext, useContext } from "react";
import { DEFAULT_WA, waHref, waText, type WaConfig, type WaData, type WaKind } from "@/lib/whatsapp";
import type { Locale } from "@/lib/i18n";

const Ctx = createContext<WaConfig>(DEFAULT_WA);

/** Hands the WhatsApp number and templates from the CMS to client components. */
export default function WaProvider({ cfg, children }: { cfg: WaConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={cfg}>{children}</Ctx.Provider>;
}

export function useWa() {
  const cfg = useContext(Ctx);
  return {
    href: (kind: WaKind, locale: Locale, data?: WaData) => waHref(kind, locale, data, cfg),
    text: (kind: WaKind, locale: Locale, data?: WaData) => waText(kind, locale, data, cfg),
  };
}
