import type { Locale } from "@/lib/i18n";

const work = {
  en: {
    metaTitle: "Work: mascot & character design portfolio",
    metaDesc: "Portfolio of hand-drawn retro mascots, character designs, badges and lettering made for brands.",
    strip: ["Work", "Jember, East Java"],
    eyebrow: "Selected work",
    title: ["Fresh off", "the press"],
    lede: "Mascots, badges and lettering, drawn by hand. Tap a project to look closer.",
    filterBy: "Filter by",
    filterAria: "Filter projects",
    empty: "Nothing in this category yet.",
    sheet: {
      close: "Close project",
      client: "Client",
      year: "Year",
      services: "Services",
      descPh: "Description placeholder",
      cta: "Want one like this?",
      galleryAlt: "Project image",
      galleryAltPh: "Placeholder image",
      coverAltPh: "Placeholder art",
    },
    ctaTitle: "Want a character like these?",
    ctaSub: "Tell me about your brand on WhatsApp. Every project here started with one chat.",
  },
  id: {
    metaTitle: "Karya: portofolio desain maskot",
    metaDesc: "Portofolio maskot retro, desain karakter, badge, dan lettering yang digambar tangan untuk berbagai brand.",
    strip: ["Karya", "Jember, Jawa Timur"],
    eyebrow: "Karya pilihan",
    title: ["Baru keluar", "dari meja sablon"],
    lede: "Maskot, badge, dan lettering, semuanya digambar tangan. Klik project-nya buat lihat lebih dekat.",
    filterBy: "Saring",
    filterAria: "Saring project",
    empty: "Belum ada karya di kategori ini.",
    sheet: {
      close: "Tutup project",
      client: "Klien",
      year: "Tahun",
      services: "Layanan",
      descPh: "Placeholder deskripsi",
      cta: "Mau yang kayak gini?",
      galleryAlt: "Gambar project",
      galleryAltPh: "Gambar placeholder",
      coverAltPh: "Gambar placeholder",
    },
    ctaTitle: "Mau karakter kayak gini?",
    ctaSub: "Ceritain brand kamu lewat WhatsApp. Semua project di sini juga dimulai dari satu chat.",
  },
};

export type WorkDict = (typeof work)["en"];
export const getWork = (l: Locale): WorkDict => work[l];

export default work;
