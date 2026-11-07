import { createClient, type QueryParams } from "next-sanity";
import { draftMode } from "next/headers";
import { apiVersion, dataset, projectId } from "./env";

/** Read client. Published content only; pages cache it until the Studio webhook calls /api/revalidate. */
export const client = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published", stega: false });

/**
 * Every CMS read carries the "sanity" tag, so one webhook refreshes the whole site within seconds.
 * In draft mode (Pratinjau in the Studio) reads include unpublished drafts and skip the cache.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  if (await isDraft()) {
    return client.fetch<T>(query, params, {
      perspective: "drafts",
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
      stega: false,
      cache: "no-store",
    });
  }
  return client.fetch<T>(query, params, { next: { revalidate: 3600, tags: ["sanity"] } });
}

/** draftMode() throws outside a request (build-time params, sitemap at build): treat that as off. */
async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}
