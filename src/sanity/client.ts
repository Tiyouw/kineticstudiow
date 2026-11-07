import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/** Read client. Published content only; pages cache it until the Studio webhook calls /api/revalidate. */
export const client = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" });

/** Every CMS read carries the "sanity" tag, so one webhook refreshes the whole site within seconds. */
export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate: 3600, tags: ["sanity"] } });
}
