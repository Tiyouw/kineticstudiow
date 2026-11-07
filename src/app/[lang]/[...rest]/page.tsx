import { notFound } from "next/navigation";

/** Any unknown path under /id or /en shows the styled 404 (not-found.tsx) inside the site layout. */
export default function CatchAll() {
  notFound();
}
