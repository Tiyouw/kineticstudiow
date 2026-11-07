import { notFound } from "next/navigation";

/**
 * Any unknown path under /id or /en shows the styled 404 (not-found.tsx) inside the site layout.
 * Rendered per request: a statically rendered route that calls notFound() sends an empty
 * HTML shell and draws the 404 only once JavaScript runs.
 */
export const dynamic = "force-dynamic";

export default function CatchAll() {
  notFound();
}
