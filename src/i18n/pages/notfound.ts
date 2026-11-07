import type { Locale } from "@/lib/i18n";

const notfound = {
  en: {
    metaTitle: "Page not found",
    eyebrow: "Error 404",
    title: ["This page", "isn't on", "the shelf."],
    lede: "Maybe it was sold, moved, or the link has a typo. The mascots are still here.",
    home: "Back to home",
    shop: "See the shop",
    ask: "Ask on WhatsApp",
    stamp: "Not found",
    art: "The Kinetic blue jay giving a peace sign",
  },
  id: {
    metaTitle: "Halaman tidak ditemukan",
    eyebrow: "Error 404",
    title: ["Halaman ini", "nggak ada", "di etalase."],
    lede: "Mungkin sudah pindah, dihapus, atau link-nya salah ketik. Tenang, maskot-maskotnya masih di sini.",
    home: "Balik ke beranda",
    shop: "Lihat toko",
    ask: "Tanya di WhatsApp",
    stamp: "Tidak ada",
    art: "Blue jay Kinetic memberi salam damai",
  },
} satisfies Record<Locale, unknown>;

export const getNotFound = (l: Locale) => notfound[l];
