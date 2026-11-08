import { defineArrayMember, defineField, defineType } from "sanity";
import { COPY_TITLES, DICTS, type CopyKey } from "@/i18n/dicts";
import { copyFields } from "../copy";
import { QUESTIONS } from "@/lib/fatwaQuestions";
import SharePanel from "../SharePanel";
import ThreadsPostInfo from "../ThreadsPostInfo";
import ThreadsAccountsInput from "../ThreadsAccountsInput";

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
    defineField({ name: "slug", title: "Alamat halaman", type: "slug", options: { source: "title.en", maxLength: 60 }, description: "Bagian akhir link karya, misalnya burger-bros. Klik Generate. Kosong = dibuat otomatis dari judul." }),
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

/** Simple rich text for Journal posts: paragraphs, bold/italic and links. */
const richText = (name: string, title: string) =>
  defineField({
    name, title, type: "array",
    of: [defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraf", value: "normal" }],
      lists: [],
      marks: {
        decorators: [{ title: "Tebal", value: "strong" }, { title: "Miring", value: "em" }],
        annotations: [defineArrayMember({ name: "link", title: "Link", type: "object", fields: [defineField({ name: "href", title: "Alamat", type: "url", validation: (r) => r.uri({ scheme: ["http", "https", "mailto"], allowRelative: true }) })] })],
      },
    })],
  });

const isShort = ({ document }: { document?: Record<string, unknown> }) => document?.kind === "short";

export const post = defineType({
  name: "post", title: "Journal", type: "document",
  fields: [
    defineField({
      name: "kind", title: "Jenis", type: "string", initialValue: "article",
      options: { list: [{ title: "Tulisan Journal (halaman di situs)", value: "article" }, { title: "Post Threads saja", value: "short" }], layout: "radio" },
      description: "Post Threads saja tidak punya halaman di situs: hanya caption + foto yang dikirim ke Threads (bisa dijadwalkan juga).",
    }),
    defineField({
      name: "title", title: "Judul", type: "object", options: { columns: 2 },
      description: "Untuk Post Threads saja: nama internal di Agenda, tidak ikut terkirim.",
      fields: [
        defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
        defineField({ name: "id", title: "Indonesia", type: "string", description: "Opsional. Kosong = pakai judul English." }),
      ],
    }),
    defineField({
      name: "stage", title: "Tahap (Agenda)", type: "string", initialValue: "draft",
      options: { list: [{ title: "Ide", value: "idea" }, { title: "Draf", value: "draft" }, { title: "Siap terbit", value: "ready" }], layout: "radio", direction: "horizontal" },
      description: "Hanya untuk papan Agenda, tidak tampil di situs. Setelah di-Publish, tulisan otomatis masuk Terjadwal/Terbit.",
      hidden: ({ document }) => !!document?._id && !String(document._id).startsWith("drafts."),
    }),
    defineField({ name: "ideaNotes", title: "Catatan ide", type: "text", rows: 3, description: "Catatan pribadi (tidak tampil di situs)." }),
    defineField({ name: "slug", title: "Alamat halaman", type: "slug", options: { source: "title.en", maxLength: 80 }, description: "Klik Generate. Jadi bagian link: /journal/judul-tulisan", hidden: isShort,
      validation: (r) => r.custom((v: { current?: string } | undefined, ctx) => (ctx.document?.kind === "short" || v?.current ? true : "Wajib untuk tulisan Journal")) }),
    defineField({ name: "publishedAt", title: "Tanggal terbit", type: "datetime", initialValue: () => new Date().toISOString(), validation: (r) => r.required(), description: "Mau dijadwalkan? Isi tanggal & jam nanti, lalu Publish. Tulisan tersembunyi sampai waktunya, lalu tampil di situs (dan terkirim ke Threads) dalam ±15 menit setelahnya. Lihat semua jadwal di menu Agenda." }),
    defineField({ name: "cover", title: "Foto sampul", type: "image", options: { hotspot: true },
      validation: (r) => r.custom((v: { asset?: unknown } | undefined, ctx) => (ctx.document?.kind === "short" || v?.asset ? true : "Wajib untuk tulisan Journal")) }),
    defineField({ name: "gallery", title: "Galeri", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true } })], validation: (r) => r.max(10), description: "Maksimal 10 foto." }),
    defineField({
      name: "body", title: "Isi tulisan", type: "object", hidden: isShort,
      fields: [richText("en", "English"), { ...richText("id", "Indonesia"), description: "Opsional. Kosong = pakai versi English." }],
    }),
    defineField({ name: "caption", title: "Caption media sosial", type: "text", rows: 4,
      validation: (r) => r.max(500).custom((v: string | undefined, ctx) => (ctx.document?.kind !== "short" || v?.trim() ? true : "Wajib untuk Post Threads saja")),
      description: "Teks pendek untuk Threads/X (maks. 500 karakter). Link ke tulisan (atau Link di bawah) ditambahkan otomatis." }),
    defineField({ name: "link", title: "Link (opsional)", type: "url", hidden: (c) => !isShort(c), description: "Ditambahkan di akhir post Threads, misalnya halaman maskot di toko." }),
    defineField({ name: "promoFor", title: "Promo untuk maskot", type: "reference", weak: true, to: [{ type: "product" }], readOnly: true, hidden: ({ document }) => !document?.promoFor, description: "Dibuat otomatis saat maskot premade baru terbit. Tidak dikirim kalau maskotnya sudah terjual." }),
    // nothing is stored here: the field only shows the share buttons and ready-to-paste captions
    defineField({ name: "share", title: "Bagikan", type: "string", readOnly: true, hidden: isShort, components: { input: SharePanel }, description: "Buka X, Threads, dan lainnya dengan caption dan link sudah terisi, atau copy caption-nya." }),
    defineField({ name: "related", title: "Terkait dengan", hidden: isShort, type: "reference", to: [{ type: "product" }, { type: "project" }], description: "Opsional: maskot atau karya yang dibahas. Tampil sebagai kartu di bawah tulisan." }),
    defineField({
      name: "threadsAccounts", title: "Kirim ke Threads", type: "array", of: [defineArrayMember({ type: "string" })],
      components: { input: ThreadsAccountsInput },
      description: "Opsional. Saat di-Publish, tulisan ini otomatis diposting ke akun yang dicentang: foto, caption, dan link. Sekali per akun.",
    }),
    defineField({ name: "shareIgStory", title: "Teruskan ke Instagram Story", type: "boolean", initialValue: false, hidden: ({ document }) => !(document?.threadsAccounts as string[] | undefined)?.length, description: "Post Threads-nya juga muncul sebagai Story (24 jam) di Instagram yang terhubung dengan tiap akun Threads itu." }),
    // nothing is stored here: shows the Threads link, numbers or the reason it failed
    defineField({ name: "threadsInfo", title: "Status Threads", type: "string", readOnly: true, components: { input: ThreadsPostInfo } }),
    defineField({ name: "shareX", title: "Kirim ke X (nanti)", type: "boolean", initialValue: false, description: "Belum aktif." }),
    defineField({
      name: "social", title: "Status posting media sosial", type: "object", readOnly: true, options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "threads", title: "Threads", type: "array",
          of: [defineArrayMember({
            type: "object", name: "threadsShare",
            fields: [
              defineField({ name: "account", title: "ID akun", type: "string" }),
              defineField({ name: "username", title: "Akun", type: "string" }),
              defineField({ name: "id", title: "ID post", type: "string" }),
              defineField({ name: "url", title: "Link", type: "url" }),
              defineField({ name: "sharedAt", title: "Dikirim pada", type: "datetime" }),
              defineField({ name: "error", title: "Kendala", type: "string" }),
              defineField({ name: "igStoryStatus", title: "Instagram Story", type: "string" }),
              defineField({ name: "removedAt", title: "Dihapus dari Threads pada", type: "datetime" }),
            ],
            preview: { select: { title: "username", subtitle: "url" }, prepare: ({ title, subtitle }) => ({ title: title ? `@${title}` : "Akun Threads", subtitle }) },
          })],
        }),
        defineField({ name: "threadsLock", title: "Sedang dikirim sejak", type: "datetime", hidden: true }),
        defineField({ name: "xId", title: "ID X", type: "string" }),
        defineField({ name: "xUrl", title: "Link X", type: "url" }),
        defineField({ name: "sharedAt", title: "Dikirim pada", type: "datetime" }),
      ],
    }),
  ],
  orderings: [{ title: "Terbaru", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title.en", date: "publishedAt", media: "cover", kind: "kind" },
    prepare: ({ title, date, media, kind }) => ({
      title: `${kind === "short" ? "[Threads] " : ""}${title ?? "(tanpa judul)"}`,
      subtitle: date
        ? `${new Date(date) > new Date() ? "Terjadwal " : ""}${new Date(date).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", ...(new Date(date) > new Date() ? { hour: "2-digit", minute: "2-digit" } : {}) })}`
        : "Belum diberi tanggal",
      media,
    }),
  },
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

/** Agenda's fixed posting slots ("tiap Selasa 09.00"), edited from the Agenda tool. */
const agendaSettings = defineType({
  name: "agendaSettings", title: "Pengaturan Agenda", type: "document",
  fields: [
    defineField({
      name: "slots", title: "Slot posting", type: "array",
      of: [defineArrayMember({
        type: "object", name: "slot",
        fields: [
          defineField({ name: "day", title: "Hari (0 = Minggu)", type: "number", validation: (r) => r.min(0).max(6).integer() }),
          defineField({ name: "time", title: "Jam (HH:MM)", type: "string", validation: (r) => r.regex(/^\d{2}:\d{2}$/) }),
        ],
      })],
    }),
  ],
});

export const schemaTypes = [product, project, testimonial, clientMark, post, settings, fatwaAnswers, agendaSettings, ...copyTypes];
export const SINGLETONS = ["settings", "fatwaAnswers", "agendaSettings", ...copyTypes.map((t) => t.name)];
