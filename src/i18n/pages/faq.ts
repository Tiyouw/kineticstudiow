/**
 * FAQ page. Answers confirmed by Fatwa in the questionnaire (Nov 2026).
 */
const faq = {
  en: {
    metaTitle: "FAQ: custom and premade mascots",
    metaDesc: "Prices, turnaround, revisions, files, rights and paying from abroad: answers about ordering a custom or premade mascot from Kinetic Studiow.",
    pageName: "FAQ",
    eyebrow: "Good to know",
    titleLines: ["Questions,", "answered"],
    lede: "Everything people usually ask before they order. Still unsure? Send a message and Fatwa will answer.",
    draftTag: "Draft, being confirmed",
    groups: [
      {
        title: "Custom mascots",
        items: [
          { q: "How much does a custom mascot cost?", a: "Custom mascots start from $55 to $110, depending on the detail. Send the brief and you get an exact quote, usually within the hour." },
          { q: "How long does it take?", a: "It depends on the project. You get an estimate once we've read your brief. Rush orders are possible for an extra fee." },
          { q: "How many revisions are included?", a: "Three rounds of revisions." },
          { q: "Which files will I get?", a: "PNG, JPG and PDF, plus the PSD or Procreate source file." },
          { q: "Who owns the mascot?", a: "You do. Once it's paid in full, all rights to the custom design move to your brand." },
        ],
      },
      {
        title: "Premade mascots",
        items: [
          { q: "What does \"sold once\" mean?", a: "Each premade mascot is sold to one brand only. When it's bought, it leaves the shop and is never sold again." },
          { q: "What comes with a premade mascot?", a: "Vector files (AI and SVG), PNGs on a transparent background, and a free name and colour tweak to fit your brand." },
          { q: "Can I change the mascot?", a: "The name and colours are adjusted for free. Your brand can use it on signage, packaging, social media and merch." },
          { q: "How soon do I get the files?", a: "Within 24 hours of payment." },
        ],
      },
      {
        title: "Working together",
        items: [
          { q: "Do you work with clients outside Indonesia?", a: "Yes, with brands anywhere. Chat with us in English on WhatsApp." },
          { q: "How do I pay?", a: "50% up front to start, the other 50% before the final files. Clients abroad can pay with Wise." },
          { q: "How fast do you reply?", a: "Usually within an hour, often right away." },
          { q: "How do I start?", a: "Fill in the custom order form, or send a WhatsApp message with your brand name, what you sell and where the mascot will be used." },
        ],
      },
    ],
    ctaTitle: "Ask anything else",
  },
  id: {
    metaTitle: "FAQ: maskot custom dan premade",
    metaDesc: "Harga, lama pengerjaan, revisi, file, hak pakai, dan cara bayar: jawaban seputar order maskot custom atau premade di Kinetic Studiow.",
    pageName: "FAQ",
    eyebrow: "Perlu kamu tahu",
    titleLines: ["Pertanyaan,", "terjawab"],
    lede: "Hal-hal yang biasanya ditanyakan sebelum order. Masih ragu? Kirim pesan, Fatwa yang jawab.",
    draftTag: "Draf, sedang dikonfirmasi",
    groups: [
      {
        title: "Maskot custom",
        items: [
          { q: "Berapa harga maskot custom?", a: "Mulai Rp 300.000 sampai Rp 500.000, tergantung detailnya. Kirim brief-nya dan kamu dapat harga pastinya, biasanya dalam sejam." },
          { q: "Berapa lama pengerjaannya?", a: "Tergantung project. Perkiraannya kami kasih setelah baca brief-mu. Butuh cepat? Bisa rush order dengan biaya tambahan." },
          { q: "Dapat berapa kali revisi?", a: "Tiga kali revisi." },
          { q: "File apa saja yang aku dapat?", a: "PNG, JPG, dan PDF, plus file mentah PSD atau Procreate." },
          { q: "Siapa pemilik maskotnya?", a: "Kamu. Setelah lunas, hak penuh desain custom pindah ke brand kamu." },
        ],
      },
      {
        title: "Maskot premade",
        items: [
          { q: "Apa maksudnya \"dijual sekali\"?", a: "Tiap maskot premade cuma dijual ke satu brand. Begitu dibeli, ia keluar dari toko dan tidak dijual lagi." },
          { q: "Dapat apa saja kalau beli maskot premade?", a: "File vektor (AI dan SVG), PNG dengan latar transparan, plus gratis ubah nama dan warna biar pas sama brand kamu." },
          { q: "Maskotnya boleh diubah?", a: "Nama dan warnanya kami sesuaikan gratis. Brand kamu boleh memakainya untuk signage, kemasan, media sosial, dan merch." },
          { q: "Kapan file-nya dikirim?", a: "Maksimal 1×24 jam setelah pembayaran." },
        ],
      },
      {
        title: "Kerja bareng",
        items: [
          { q: "Melayani klien dari luar Indonesia?", a: "Bisa, dari mana saja. Chat dalam bahasa Inggris lewat WhatsApp juga oke." },
          { q: "Bayarnya gimana?", a: "DP 50% untuk mulai, 50% sisanya sebelum file final dikirim. Klien luar negeri bisa bayar lewat Wise." },
          { q: "Balas chat-nya cepat?", a: "Biasanya kurang dari sejam, sering langsung dibalas." },
          { q: "Mulainya dari mana?", a: "Isi form pesan custom, atau kirim pesan WhatsApp: nama brand, jualan apa, dan maskotnya mau dipakai di mana." },
        ],
      },
    ],
    ctaTitle: "Tanya yang lain",
  },
};

export type FaqDict = (typeof faq)["en"];
export default faq;
