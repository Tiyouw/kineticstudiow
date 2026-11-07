import { defineArrayMember, defineField, defineType } from "sanity";
import { COPY_TITLES, DICTS, type CopyKey } from "@/i18n/dicts";
import { copyFields } from "../copy";
import { QUESTIONS } from "@/lib/fatwaQuestions";

const L = (name: string, title: string, long = false, required = false) =>
  defineField({
    name, title, type: "object", options: { columns: 2 },
    fields: [
      long
        ? defineField({ name: "id", title: "Indonesia", type: "text", rows: 3, validation: required ? (r) => r.required() : undefined })
        : defineField({ name: "id", title: "Indonesia", type: "string", validation: required ? (r) => r.required() : undefined }),
      long ? defineField({ name: "en", title: "English", type: "text", rows: 3 }) : defineField({ name: "en", title: "English", type: "string" }),
    ],
  });

const TONES = [
  { title: "Krem (default)", value: "" },
  { title: "Biru tinta", value: "art-ink" },
  { title: "Merah", value: "art-red" },
];
const img = (name: string, title: string, required = false) =>
  defineField({ name, title, type: "image", options: { hotspot: true }, validation: required ? (r) => r.required() : undefined });

export const product = defineType({
  name: "product", title: "Produk (maskot premade)", type: "document",
  fields: [
    defineField({ name: "no", title: "Nomor", type: "string", description: "Tiga digit, misalnya 012. Urutan toko mengikuti nomor ini.", validation: (r) => r.required() }),
    defineField({ name: "name", title: "Nama", type: "string", description: "Ditulis kapital, misalnya BURGER BROS.", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Alamat halaman", type: "slug", options: { source: "name" }, description: "Klik Generate. Jadi bagian link: /shop/burger-bros", validation: (r) => r.required() }),
    defineField({ name: "sold", title: "Sudah terjual", type: "boolean", initialValue: false }),
    defineField({ name: "priceIdr", title: "Harga (Rp)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "wasIdr", title: "Harga coret (Rp)", type: "number", description: "Kosongkan kalau tidak ada diskon." }),
    defineField({ name: "priceUsd", title: "Harga (USD)", type: "number", validation: (r) => r.min(0) }),
    img("image", "Gambar utama", true),
    defineField({ name: "gallery", title: "Galeri", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true } })], description: "Gambar tambahan di halaman produk." }),
    defineField({ name: "tone", title: "Warna latar kartu", type: "string", options: { list: TONES, layout: "radio", direction: "horizontal" }, initialValue: "" }),
    defineField({ name: "isPlaceholder", title: "Masih placeholder", type: "boolean", initialValue: false, description: "Menampilkan label 'placeholder' di gambar." }),
  ],
  orderings: [{ title: "Nomor", name: "no", by: [{ field: "no", direction: "asc" }] }],
  preview: {
    select: { no: "no", name: "name", sold: "sold", media: "image", price: "priceIdr" },
    prepare: ({ no, name, sold, media, price }) => ({ title: `#${no} ${name ?? ""}`, subtitle: `${sold ? "TERJUAL · " : ""}Rp ${(price ?? 0).toLocaleString("id-ID")}`, media }),
  },
});

const CATEGORIES = [
  { title: "Maskot", value: "mascot" },
  { title: "Identitas brand", value: "brand" },
  { title: "Lettering", value: "lettering" },
  { title: "Merch", value: "merch" },
];

export const project = defineType({
  name: "project", title: "Karya", type: "document",
  fields: [
    defineField({ name: "id", title: "Urutan", type: "string", description: "Dua digit: 01 tampil paling depan.", validation: (r) => r.required() }),
    L("title", "Judul", false, true),
    defineField({ name: "category", title: "Kategori", type: "string", options: { list: CATEGORIES, layout: "radio" }, validation: (r) => r.required() }),
    L("year", "Tahun"),
    L("client", "Klien"),
    L("services", "Layanan"),
    L("description", "Deskripsi", true),
    img("image", "Gambar utama", true),
    defineField({ name: "gallery", title: "Galeri", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true } })] }),
    defineField({ name: "tone", title: "Warna latar", type: "string", options: { list: TONES, layout: "radio", direction: "horizontal" }, initialValue: "" }),
    defineField({ name: "real", title: "Karya asli (bukan placeholder)", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Urutan", name: "id", by: [{ field: "id", direction: "asc" }] }],
  preview: { select: { id: "id", title: "title.id", cat: "category", media: "image" }, prepare: ({ id, title, cat, media }) => ({ title: `${id} · ${title ?? ""}`, subtitle: cat, media }) },
});

export const testimonial = defineType({
  name: "testimonial", title: "Testimoni", type: "document",
  fields: [
    L("quote", "Kutipan", true, true),
    L("who", "Nama dan keterangan", false, true),
    defineField({ name: "order", title: "Urutan", type: "number", initialValue: 1 }),
    defineField({ name: "isPlaceholder", title: "Masih placeholder", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Urutan", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "who.id", subtitle: "quote.id" } },
});

export const clientMark = defineType({
  name: "clientMark", title: "Logo klien", type: "document",
  fields: [
    defineField({ name: "name", title: "Nama klien", type: "string", validation: (r) => r.required() }),
    defineField({ name: "variant", title: "Gaya tulisan", type: "number", options: { list: [1, 2, 3, 4, 5, 6] }, initialValue: 1, description: "Gaya 1 sampai 6, sesuai desain strip logo." }),
    img("logo", "Logo (opsional)"),
    defineField({ name: "order", title: "Urutan", type: "number", initialValue: 1 }),
  ],
  orderings: [{ title: "Urutan", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", media: "logo" } },
});

const WA_KINDS: { name: string; title: string; vars: string }[] = [
  { name: "general", title: "Chat umum", vars: "" },
  { name: "order", title: "Beli maskot premade", vars: "{no} {name} {price}" },
  { name: "ask", title: "Tanya soal maskot", vars: "{no} {name}" },
  { name: "project", title: "Lihat karya", vars: "{project}" },
  { name: "custom", title: "Form pesan custom", vars: "{name} {brand} {business} {services} {style} {usage} {budget} {deadline} {notes}" },
];

export const settings = defineType({
  name: "settings", title: "WhatsApp & kontak", type: "document",
  fields: [
    defineField({ name: "waNumber", title: "Nomor WhatsApp", type: "string", description: "Format internasional tanpa + atau spasi, misalnya 6285156487036.", validation: (r) => r.required().regex(/^\d{8,15}$/, { name: "angka saja" }) }),
    defineField({
      name: "templates", title: "Template chat", type: "object",
      fields: WA_KINDS.map((k) => ({ ...L(k.name, k.title, true), description: k.vars ? `Diisi otomatis: ${k.vars}. Jangan ubah kata di dalam kurung kurawal.` : undefined })),
    }),
  ],
  preview: { prepare: () => ({ title: "WhatsApp & kontak" }) },
});

export const copyTypes = (Object.keys(DICTS) as CopyKey[]).map((k) =>
  defineType({
    name: `copy_${k}`, title: COPY_TITLES[k], type: "document",
    fields: copyFields(DICTS[k]) as ReturnType<typeof defineField>[],
    preview: { prepare: () => ({ title: COPY_TITLES[k] }) },
  }),
);

/** Fatwa's answers from the questionnaire page (/q/<token>), shown read-only. */
const fatwaAnswers = defineType({
  name: "fatwaAnswers", title: "Jawaban kuesioner", type: "document", readOnly: true,
  fields: [
    defineField({ name: "updatedAt", title: "Terakhir diisi", type: "datetime" }),
    defineField({
      name: "answers", title: "Jawaban", type: "object",
      fields: QUESTIONS.map((q) => defineField({
        name: q.key, title: q.q, type: "object",
        fields: [
          defineField({ name: "picks", title: "Pilihan", type: "array", of: [defineArrayMember({ type: "string" })] }),
          defineField({ name: "other", title: "Lainnya / ubah", type: "text", rows: 2 }),
          defineField({ name: "text", title: "Jawaban", type: "text", rows: 3 }),
        ],
      })),
    }),
  ],
  preview: { prepare: () => ({ title: "Jawaban kuesioner" }) },
});

export const schemaTypes = [product, project, testimonial, clientMark, settings, fatwaAnswers, ...copyTypes];
export const SINGLETONS = ["settings", "fatwaAnswers", ...copyTypes.map((t) => t.name)];
