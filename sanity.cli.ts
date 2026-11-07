import { defineCliConfig } from "sanity/cli";

/** For the sanity CLI (dataset export/import in the backup workflow). */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "yqf1n0yb",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
});
