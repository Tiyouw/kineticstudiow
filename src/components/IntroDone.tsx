"use client";
import { useEffect } from "react";

/** After the opening screen has played, later client-side visits to Home skip it. */
export default function IntroDone() {
  useEffect(() => {
    const t = window.setTimeout(() => document.documentElement.classList.add("skip-intro"), 2800);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
