import type { Locale } from "@/lib/i18n";

const shop = {
  en: {
    metaTitle: "Shop: premade mascots for sale",
    metaDesc: "Premade retro cartoon mascots for sale. Each one is sold only once, so your brand gets a character no one else has.",
    pageName: "Shop",
    place: "Jember, East Java",
    eyebrow: "Box office",
    title: ["Premade", "mascots"],
    lede: "Each mascot is sold once: when it finds its brand, it leaves the shop.",
    howEyebrow: "How buying works",
    steps: [
      { title: "Pick a mascot", desc: "Browse the tickets below and choose the character that fits your brand." },
      { title: "Chat on WhatsApp", desc: "Tap Order and send the message. We confirm it is still free." },
      { title: "Get the files and the rights", desc: "Pay, then receive the files and the rights. The mascot leaves the shop." },
    ],
    shelfTitle: "On the shelf",
    filterAria: "Filter mascots",
    filters: { all: "All", available: "Available", sold: "Sold" },
    countAll: "Showing all {n} mascots",
    countAvailable: "Showing {n} available {m}",
    countSold: "Showing {n} sold {m}",
    one: "mascot",
    many: "mascots",
    licenceTitle: "Licence",
    licence: "Buying a premade mascot gives your brand the right to use it on signage, packaging, social media and merch. Nobody else gets the same character.",
    licencePh: "Terms placeholder, confirm with Fatwa",
    ctaTitle: "None of these feel like yours?",
    ctaSub: "Get a character drawn for your brand from scratch. It starts with one chat.",
  },
  id: {
    metaTitle: "Toko: maskot premade siap pakai",
    metaDesc: "Maskot kartun retro premade yang siap dibeli. Tiap maskot cuma dijual sekali, jadi brand-mu punya karakter yang tidak dimiliki orang lain.",
    pageName: "Toko",
    place: "Jember, Jawa Timur",
    eyebrow: "Loket",
    title: ["Maskot", "premade"],
    lede: "Tiap maskot cuma dijual sekali: begitu ketemu brand-nya, dia keluar dari toko.",
    howEyebrow: "Cara belinya",
    steps: [
      { title: "Pilih maskot", desc: "Lihat-lihat tiket di bawah, lalu pilih karakter yang paling cocok sama brand kamu." },
      { title: "Chat via WhatsApp", desc: "Tap Pesan lalu kirim pesannya. Kami cek dulu maskotnya masih tersedia." },
      { title: "Terima file dan haknya", desc: "Bayar, lalu kamu terima file beserta hak pakainya. Maskotnya keluar dari toko." },
    ],
    shelfTitle: "Di etalase",
    filterAria: "Saring maskot",
    filters: { all: "Semua", available: "Tersedia", sold: "Terjual" },
    countAll: "Menampilkan semua {n} maskot",
    countAvailable: "Menampilkan {n} maskot tersedia",
    countSold: "Menampilkan {n} maskot terjual",
    one: "maskot",
    many: "maskot",
    licenceTitle: "Lisensi",
    licence: "Dengan membeli maskot premade, brand kamu berhak memakainya untuk signage, kemasan, media sosial, dan merch. Nggak ada brand lain yang dapat karakter yang sama.",
    licencePh: "Placeholder ketentuan, konfirmasi ke Fatwa",
    ctaTitle: "Belum ada yang cocok?",
    ctaSub: "Bikin karakter khusus untuk brand kamu dari nol. Mulainya cukup dari satu chat.",
  },
};

export type ShopDict = (typeof shop)["en"];
export const getShop = (l: Locale): ShopDict => shop[l];

export default shop;
