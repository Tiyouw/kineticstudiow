import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/client";

/** Pratinjau in the Studio calls this with a one-time secret; it turns on draft mode so pages show unpublished edits. */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
