/**
 * Content access. Pages call these async getters only, so swapping the static data for a CMS
 * later means changing this file, not the pages.
 */
import { clientMarks, products, projects, testimonials } from "./data";

export * from "./types";

export async function getProducts() { return products; }
export async function getProduct(slug: string) { return products.find((p) => p.slug === slug) ?? null; }
export async function getProjects() { return projects; }
export async function getClientMarks() { return clientMarks; }
export async function getTestimonials() { return testimonials; }

export const formatIdr = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const formatUsd = (n: number) => "$" + n;
