/**
 * FAQ page. DRAFT: answers marked (?) in comments still need Fatwa's confirmation (questionnaire at /q/...).
 * The page stays noindex and unlinked until FAQ_LIVE in the FAQ page is true.
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
          { q: "How much does a custom mascot cost?", a: "Every brand is different, so the price depends on what you need: one mascot, a few poses, a full identity. Send the brief and you get a quote, usually within a day." },
          { q: "How long does it take?", a: "Most mascots take two to four weeks from the first sketch to final files." },
          { q: "How many revisions are included?", a: "Two rounds of revisions on the chosen sketch, then small tweaks on the final art." },
          { q: "Which files will I get?", a: "Vector files (AI and SVG), PNGs on a transparent background and print-ready one-ink versions." },
          { q: "Who owns the mascot?", a: "Once it's paid in full, your brand can use the mascot commercially: signage, packaging, social media and merch." },
        ],
      },
      {
        title: "Premade mascots",
        items: [
          { q: "What does \"sold once\" mean?", a: "Each premade mascot is sold to one brand only. When it's bought, it leaves the shop and is never sold again." },
          { q: "What comes with a premade mascot?", a: "Vector files (AI and SVG), transparent PNGs, full-colour and one-ink versions, and a name and colour tweak to fit your brand." },
          { q: "How soon do I get the files?", a: "Shortly after payment is confirmed, once the name and colour tweak is done." },
        ],
      },
      {
        title: "Working together",
        items: [
          { q: "Do you work with clients outside Indonesia?", a: "Yes. We work with brands anywhere, in English, on WhatsApp or by email." },
          { q: "How do I pay from abroad?", a: "Half up front to start, the rest before the final files. International clients can pay by PayPal or Wise." },
          { q: "How do I start?", a: "Fill in the custom order form, or send a message on WhatsApp or by email with your brand name, what you sell and where the mascot will be used." },
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
          { q: "Berapa harga maskot custom?", a: "Tiap brand beda kebutuhannya: satu maskot, beberapa pose, atau identitas lengkap. Kirim brief-nya dan kamu dapat penawaran, biasanya dalam sehari." },
          { q: "Berapa lama pengerjaannya?", a: "Biasanya dua sampai empat minggu, dari sketsa pertama sampai file final." },
          { q: "Dapat berapa kali revisi?", a: "Dua putaran revisi di sketsa yang kamu pilih, lalu penyesuaian kecil di artwork final." },
          { q: "File apa saja yang aku dapat?", a: "File vektor (AI dan SVG), PNG dengan latar transparan, dan versi satu tinta yang siap cetak." },
          { q: "Siapa pemilik maskotnya?", a: "Setelah lunas, brand kamu boleh memakai maskotnya untuk keperluan komersial: signage, kemasan, media sosial, dan merch." },
        ],
      },
      {
        title: "Maskot premade",
        items: [
          { q: "Apa maksudnya \"dijual sekali\"?", a: "Tiap maskot premade cuma dijual ke satu brand. Begitu dibeli, ia keluar dari toko dan tidak dijual lagi." },
          { q: "Dapat apa saja kalau beli maskot premade?", a: "File vektor (AI dan SVG), PNG transparan, versi full colour dan satu tinta, plus penyesuaian nama dan warna biar pas sama brand kamu." },
          { q: "Kapan file-nya dikirim?", a: "Tidak lama setelah pembayaran dikonfirmasi, begitu penyesuaian nama dan warnanya selesai." },
        ],
      },
      {
        title: "Kerja bareng",
        items: [
          { q: "Melayani klien dari luar Indonesia?", a: "Bisa. Kami bekerja dengan brand dari mana saja, dalam bahasa Inggris, lewat WhatsApp atau email." },
          { q: "Bayarnya gimana?", a: "Setengah di awal untuk mulai, sisanya sebelum file final dikirim. Lewat transfer bank, atau PayPal dan Wise untuk klien luar negeri." },
          { q: "Mulainya dari mana?", a: "Isi form pesan custom, atau kirim pesan lewat WhatsApp atau email: nama brand, jualan apa, dan maskotnya mau dipakai di mana." },
        ],
      },
    ],
    ctaTitle: "Tanya yang lain",
  },
};

export type FaqDict = (typeof faq)["en"];
export default faq;
