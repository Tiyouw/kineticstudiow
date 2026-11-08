"use client";
/**
 * Counts order intent, not people: one delegated listener sends a beacon to /api/track when a WhatsApp or email
 * link is clicked. The kind comes from data-track on the link (order, ask, custom, project), else "general" for
 * WhatsApp and "email" for mailto; data-slug names the mascot. No cookies, nothing personal is sent.
 */
import { useEffect } from "react";

export default function TrackClicks({ locale }: { locale: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const email = href.startsWith("mailto:");
      const wa = /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href);
      if (!email && !wa) return;
      const kind = email ? "email" : a.dataset.track || "general";
      const body = JSON.stringify({ kind, slug: a.dataset.slug || undefined, locale });
      try {
        if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
          fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
        }
      } catch { /* never block the click */ }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [locale]);
  return null;
}
