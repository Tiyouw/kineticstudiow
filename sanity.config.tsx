"use client";
/** The Studio at /studio: where Fatwa edits the site. */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { defineDocuments, defineLocations, presentationTool, type DocumentLocationResolvers } from "sanity/presentation";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, copyTypes, SINGLETONS } from "./src/sanity/schemas";
import Guide from "./src/sanity/Guide";
import ThreadsPane from "./src/sanity/ThreadsPane";
import PreviewPane from "./src/sanity/PreviewPane";
import Agenda from "./src/sanity/Agenda";
import { CalendarIcon } from "@sanity/icons";
import { DICTS } from "./src/i18n/dicts";

/** Where each copy dictionary shows on the site (path after the language). */
const COPY_PATHS: Record<string, { title: string; path: string }> = {
  common: { title: "Beranda (teks bersama)", path: "" },
  home: { title: "Beranda", path: "" },
  work: { title: "Karya", path: "/work" },
  shop: { title: "Toko", path: "/shop" },
  product: { title: "Toko", path: "/shop" },
  custom: { title: "Pesan custom", path: "/custom-order" },
  about: { title: "Tentang", path: "/about" },
  faq: { title: "FAQ", path: "/faq" },
  journal: { title: "Journal", path: "/journal" },
  privacy: { title: "Kebijakan privasi", path: "/privacy" },
};

const both = (title: string, path: string) => [
  { title: `${title} (EN)`, href: `/en${path}` },
  { title: `${title} (ID)`, href: `/id${path}` },
];

/** The "used on" list Pratinjau shows on each document. */
const locations: DocumentLocationResolvers = {
  product: defineLocations({
    select: { name: "name", slug: "slug.current" },
    resolve: (doc) => ({
      locations: doc?.slug ? [...both(`#${doc.name ?? ""}`, `/shop/${doc.slug}`), ...both("Toko", "/shop")] : both("Toko", "/shop"),
    }),
  }),
  project: defineLocations({
    select: { title: "title.en", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [...(doc?.slug ? both(doc.title ?? "Karya", `/work/${doc.slug}`) : []), ...both("Karya", "/work"), ...both("Beranda", "")],
    }),
  }),
  post: defineLocations({
    select: { title: "title.en", slug: "slug.current" },
    resolve: (doc) => ({ locations: [...(doc?.slug ? both(doc.title ?? "Tulisan", `/journal/${doc.slug}`) : []), ...both("Journal", "/journal")] }),
  }),
  testimonial: defineLocations({ message: "Tampil di Beranda", locations: both("Beranda", "") }),
  clientMark: defineLocations({ message: "Tampil di Beranda", locations: both("Beranda", "") }),
  settings: defineLocations({ message: "Nomor & template WhatsApp dipakai di semua halaman", locations: [...both("Pesan custom", "/custom-order"), ...both("Beranda", "")] }),
  ...Object.fromEntries(
    Object.keys(DICTS).filter((k) => COPY_PATHS[k]).map((k) => [`copy_${k}`, defineLocations({ locations: both(COPY_PATHS[k].title, COPY_PATHS[k].path) })]),
  ),
};

export default defineConfig({
  name: "kinetic",
  title: "Kinetic Studiow",
  basePath: "/studio",
  // the green mascot: tells the Studio apart from the site at a glance
  icon: () => <img src="/assets/studio-icon-64.png" alt="" width={25} height={25} style={{ display: "block", borderRadius: "50%" }} />,
  tools: (prev) => [...prev, { name: "agenda", title: "Agenda", icon: CalendarIcon, component: Agenda }],
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
      // every document that shows on the site gets a "Pratinjau" tab next to the form (⋯ → Split pane right: side by side)
      defaultDocumentNode: (S, { schemaType }) =>
        schemaType === "fatwaAnswers" ? S.document() : S.document().views([S.view.form().title("Edit"), S.view.component(PreviewPane).title("Pratinjau")]),
      structure: (S) =>
        S.list().title("Konten Kinetic").items([
          S.listItem().title("Panduan").id("panduan").child(S.component(Guide).id("panduan-pane").title("Panduan")),
          S.listItem().title("Jawaban kuesioner").id("fatwaAnswers").child(S.document().schemaType("fatwaAnswers").documentId("fatwaAnswers")),
          S.divider(),
          S.documentTypeListItem("product").title("Produk (maskot premade)"),
          S.documentTypeListItem("project").title("Karya"),
          S.documentTypeListItem("testimonial").title("Testimoni"),
          S.documentTypeListItem("clientMark").title("Logo klien"),
          S.documentTypeListItem("post").title("Journal"),
          S.listItem().title("Threads").id("threads").child(S.component(ThreadsPane).id("threads-pane").title("Threads")),
          S.divider(),
          S.listItem().title("WhatsApp & kontak").id("settings").child(S.document().schemaType("settings").documentId("settings").views([S.view.form().title("Edit"), S.view.component(PreviewPane).title("Pratinjau")])),
          S.listItem().title("Teks halaman").child(
            S.list().title("Teks halaman").items(copyTypes.map((t) => S.listItem().title(t.title ?? t.name).id(t.name).child(S.document().schemaType(t.name).documentId(t.name).views([S.view.form().title("Edit"), S.view.component(PreviewPane).title("Pratinjau")])))),
          ),
        ]),
    }),
    presentationTool({
      name: "pratinjau",
      title: "Pratinjau",
      previewUrl: { initial: "/en", previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } },
      resolve: {
        mainDocuments: defineDocuments([
          { route: "/:lang/shop/:slug", filter: `_type == "product" && slug.current == $slug` },
          { route: "/:lang/work/:slug", filter: `_type == "project" && slug.current == $slug` },
          { route: "/:lang/journal/:slug", filter: `_type == "post" && slug.current == $slug` },
        ]),
        locations,
      },
    }),
  ],
});
void apiVersion;
