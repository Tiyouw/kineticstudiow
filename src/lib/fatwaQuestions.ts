import shop from "@/i18n/pages/shop";
import product from "@/i18n/pages/product";
import about from "@/i18n/pages/about";

/**
 * Questions for Fatwa (the hidden page /q/<token>): the real facts that replace placeholders and draft copy.
 * Answers land in the Sanity document "fatwaAnswers", one field per question key.
 */
export type QKind = "one" | "multi" | "text" | "number";
export type Question = {
  key: string;
  kind: QKind;
  q: string;
  /** shown under the question: the current text on the site, or a hint */
  note?: string;
  choices?: string[];
  /** label for the free-text box; choice questions get "Lainnya" by default */
  otherLabel?: string;
};
export type Section = { title: string; intro?: string; questions: Question[] };

/** What one answer looks like in Sanity. "skip" in picks means "belum tahu". */
export type Answer = { picks?: string[]; other?: string; text?: string };

export const SKIP = "Belum tahu / skip";

const bio = about.id.bioA + about.id.bioMark + about.id.bioB;

export const SECTIONS: Section[] = [
  {
    title: "Order custom",
    intro: "Soal pesanan maskot custom. Tap pilihan yang paling pas, nggak perlu mikir lama.",
    questions: [
      { key: "customPrice", kind: "one", q: "Harga mulai custom maskot berapa?", choices: ["< Rp1 juta", "Rp1–2 juta", "Rp2–3 juta", "Rp3–5 juta", "> Rp5 juta"] },
      { key: "intlPrice", kind: "one", q: "Harga untuk klien luar negeri?", choices: ["Sama, rupiah dikonversi ke USD", "Sedikit lebih tinggi"], otherLabel: "Atau tulis harga USD sendiri" },
      { key: "budgetRanges", kind: "one", q: "Kisaran budget di form custom order sudah pas?", note: "Sekarang: di bawah Rp1 jt · Rp1–3 jt · Rp3–5 jt · di atas Rp5 jt", choices: ["Sudah pas"], otherLabel: "Ubah jadi" },
      { key: "turnaround", kind: "one", q: "Biasanya custom maskot selesai berapa lama?", choices: ["± 1 minggu", "1–2 minggu", "2–4 minggu", "Tergantung project"] },
      { key: "rush", kind: "one", q: "Bisa rush order / ekspres?", choices: ["Tidak", "Bisa, ada biaya tambahan"] },
      { key: "revisions", kind: "one", q: "Dapat berapa kali revisi?", choices: ["1x", "2x", "3x", "Revisi kecil bebas"] },
      { key: "payment", kind: "one", q: "Sistem bayarnya gimana?", choices: ["DP 50%, lunas 50% sebelum file final", "100% di awal"] },
      { key: "intlPay", kind: "multi", q: "Klien luar negeri bisa bayar lewat apa?", note: "Boleh pilih lebih dari satu", choices: ["PayPal", "Wise", "Transfer bank internasional", "Belum ada"] },
      { key: "customFiles", kind: "multi", q: "File apa saja yang diterima klien custom?", note: "Boleh pilih lebih dari satu", choices: ["PNG", "JPG", "SVG", "AI", "PDF", "PSD / Procreate", "Versi 1 warna (sablon)"] },
      { key: "customRights", kind: "one", q: "Hak pakai desain custom?", choices: ["Hak penuh pindah ke klien", "Lisensi pakai saja", "Tergantung paket"] },
    ],
  },
  {
    title: "Maskot premade",
    intro: "Soal maskot siap jual di halaman Shop.",
    questions: [
      { key: "premadeLicence", kind: "one", q: "Teks lisensi premade ini sudah benar?", note: `Sekarang: “${shop.id.licence}”`, choices: ["Sudah benar"], otherLabel: "Ubah jadi" },
      { key: "premadeGets", kind: "multi", q: "Yang benar-benar didapat pembeli premade?", note: "Tap semua yang memang termasuk", choices: [...product.id.gets], otherLabel: "Tambahan" },
      { key: "premadeEdits", kind: "one", q: "Maskot premade boleh diubah?", choices: ["Nama & warna gratis", "Boleh, tapi berbayar", "Tidak bisa diubah"] },
      { key: "premadeDelivery", kind: "one", q: "File premade dikirim kapan setelah bayar?", choices: ["Langsung", "Maks. 1×24 jam", "2–3 hari"] },
    ],
  },
  {
    title: "Kontak & layanan",
    questions: [
      { key: "replyTime", kind: "one", q: "Biasanya balas chat dalam berapa lama?", choices: ["< 1 jam", "Beberapa jam", "Maks. 1×24 jam"] },
      { key: "emailOrders", kind: "one", q: "Nyaman terima order lewat email hello@ dari klien luar?", choices: ["Ya, boleh", "WA saja"] },
      { key: "english", kind: "one", q: "Bisa melayani klien dalam bahasa Inggris?", choices: ["Ya, lancar", "Bisa pelan-pelan", "Lewat tulisan saja"] },
    ],
  },
  {
    title: "Tentang Kinetic",
    intro: "Buat halaman About. Yang belum siap, skip aja.",
    questions: [
      { key: "since", kind: "number", q: "Mulai gambar maskot / Kinetic berdiri sejak tahun berapa?", otherLabel: "Tahun" },
      { key: "projects", kind: "one", q: "Sudah mengerjakan kira-kira berapa project?", choices: ["< 20", "20–50", "50–100", "100+"] },
      { key: "countries", kind: "text", q: "Klien dari negara mana saja?", otherLabel: "Misal: Indonesia, Malaysia, Amerika" },
      { key: "bio", kind: "text", q: "Bio singkat versi kamu (2–3 kalimat)", note: `Contoh yang sekarang: “${bio}”`, otherLabel: "Tulis bio kamu" },
      { key: "tools", kind: "multi", q: "Tools yang dipakai?", choices: ["Procreate", "Illustrator", "Photoshop", "Kertas & pensil"] },
      { key: "testimonials", kind: "one", q: "Punya testimoni klien asli yang boleh dipasang?", choices: ["Ya, nanti dikirim lewat WA", "Belum ada"] },
      { key: "clientLogos", kind: "one", q: "Ada logo klien yang boleh dipajang?", choices: ["Ya, nanti dikirim", "Belum ada"] },
      { key: "photo", kind: "one", q: "Foto diri untuk halaman About?", choices: ["Boleh, nanti dikirim", "Pakai maskot saja"] },
      { key: "extra", kind: "text", q: "Ada hal lain yang mau ditulis di situs?", otherLabel: "Tulis di sini" },
    ],
  },
];

export const QUESTIONS = SECTIONS.flatMap((s) => s.questions);
export const QUESTION_KEYS = new Set(QUESTIONS.map((q) => q.key));
export const isAnswered = (a?: Answer) => !!a && ((a.picks?.length ?? 0) > 0 || !!a.other?.trim() || !!a.text?.trim());
