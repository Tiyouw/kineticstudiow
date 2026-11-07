"use client";
/** The Studio at /studio: where Fatwa edits the site. */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, copyTypes, SINGLETONS } from "./src/sanity/schemas";

export default defineConfig({
  name: "kinetic",
  title: "Kinetic Studiow",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // singletons can't be created from the "new document" menu
    templates: (t) => t.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) => (SINGLETONS.includes(schemaType) ? prev.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish") : prev),
  },
  plugins: [
    structureTool({
      title: "Konten",
      structure: (S) =>
        S.list().title("Konten Kinetic").items([
          S.documentTypeListItem("product").title("Produk (maskot premade)"),
          S.documentTypeListItem("project").title("Karya"),
          S.documentTypeListItem("testimonial").title("Testimoni"),
          S.documentTypeListItem("clientMark").title("Logo klien"),
          S.divider(),
          S.listItem().title("WhatsApp & kontak").id("settings").child(S.document().schemaType("settings").documentId("settings")),
          S.listItem().title("Teks halaman").child(
            S.list().title("Teks halaman").items(copyTypes.map((t) => S.listItem().title(t.title ?? t.name).id(t.name).child(S.document().schemaType(t.name).documentId(t.name)))),
          ),
        ]),
    }),
  ],
});
void apiVersion;
