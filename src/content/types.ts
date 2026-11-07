import type { L10n } from "@/lib/i18n";

/** Shapes of the editable content. A CMS (planned) will return these same types. */

export type ArtTone = "" | "art-ink" | "art-red";

export interface Product {
  no: string; // "012"
  slug: string; // "burger-bros"
  name: string; // "BURGER BROS"
  priceIdr: number;
  priceUsd: number;
  wasIdr?: number; // strike-through original price
  sold: boolean;
  image: string; // /assets/...
  gallery: string[];
  tone: ArtTone;
  isPlaceholder: boolean;
}

export type WorkCategory = "mascot" | "brand" | "lettering" | "merch";

export interface Project {
  id: string; // "01"
  title: L10n;
  category: WorkCategory;
  year: L10n;
  image: string;
  tone: ArtTone;
  real: boolean;
  client: L10n;
  services: L10n;
  description: L10n;
  gallery: string[];
}

export interface ClientMark {
  name: string;
  /** style variant from the design: mk-1 … mk-6 */
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  /** a real logo image; replaces the lettered placeholder */
  logo?: string;
}

export interface Testimonial {
  quote: L10n;
  who: L10n;
  isPlaceholder: boolean;
}
