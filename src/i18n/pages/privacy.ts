/**
 * Privacy policy. Facts checked against the code on 2026-11-08: Vercel Web Analytics (no cookies),
 * contact by WhatsApp/email links, a private questionnaire page, social posting to Kinetic's own accounts only.
 */
const privacy = {
  en: {
    metaTitle: "Privacy policy",
    metaDesc: "How the Kinetic Studiow website handles visitor data: cookieless analytics, contact by WhatsApp or email, and nothing sold or shared.",
    pageName: "Privacy",
    eyebrow: "Privacy policy",
    titleLines: ["Your data,", "kept small"],
    updated: "Last updated: 8 November 2026",
    sections: [
      { h: "Who we are", p: "This website belongs to Kinetic Studiow, a mascot and illustration studio in Jember, East Java, Indonesia. Questions about this policy: hello@kineticstudiow.my.id." },
      { h: "What we collect", p: "The site uses Vercel Web Analytics to count visits in aggregate: pages viewed, the referring site, country and device type. It sets no cookies and does not identify you. The site has no accounts, no checkout and no newsletter." },
      { h: "When you contact us", p: "Order and contact buttons open WhatsApp or your email app with a message you write and send yourself. We receive only what you send, and use it to answer you and work on your order. We don't sell or share it." },
      { h: "Social media", p: "Kinetic Studiow publishes its own Journal posts to its own Threads account (and, when chosen, as a Story on its linked Instagram account) through the official Threads API. The only data kept for this is the access token for Kinetic's own account, stored privately and deleted when the app is removed from that account. It never accesses or posts from a visitor's account. Posting to X may be added later." },
      { h: "Hosting and third parties", p: "The site is hosted by Vercel, and content and images are served by Sanity. Their privacy policies apply to the data they process to run these services. Links to WhatsApp, Instagram, Behance, Threads and X lead to services with their own policies." },
      { h: "Your choices", p: "You can ask us to delete messages or details you sent us by writing to hello@kineticstudiow.my.id. We may update this page; the date above shows the latest version." },
    ],
  },
  id: {
    metaTitle: "Kebijakan privasi",
    metaDesc: "Cara website Kinetic Studiow menangani data pengunjung: analitik tanpa cookie, kontak lewat WhatsApp atau email, dan tidak ada data yang dijual atau dibagikan.",
    pageName: "Privasi",
    eyebrow: "Kebijakan privasi",
    titleLines: ["Datamu,", "seperlunya"],
    updated: "Terakhir diperbarui: 8 November 2026",
    sections: [
      { h: "Siapa kami", p: "Website ini milik Kinetic Studiow, studio maskot dan ilustrasi di Jember, Jawa Timur, Indonesia. Pertanyaan soal kebijakan ini: hello@kineticstudiow.my.id." },
      { h: "Data yang dikumpulkan", p: "Website ini memakai Vercel Web Analytics untuk menghitung kunjungan secara agregat: halaman yang dilihat, situs asal, negara, dan jenis perangkat. Tidak ada cookie dan kamu tidak dikenali secara pribadi. Website ini tidak punya akun, checkout, atau newsletter." },
      { h: "Saat kamu menghubungi kami", p: "Tombol order dan kontak membuka WhatsApp atau aplikasi email dengan pesan yang kamu tulis dan kirim sendiri. Kami hanya menerima yang kamu kirim, dan memakainya untuk membalas serta mengerjakan pesananmu. Data itu tidak dijual atau dibagikan." },
      { h: "Media sosial", p: "Kinetic Studiow menerbitkan tulisan Journal-nya ke akun Threads milik Kinetic sendiri (dan, bila dipilih, sebagai Story di Instagram Kinetic yang terhubung) lewat API resmi Threads. Satu-satunya data yang disimpan untuk ini adalah token akses akun Kinetic sendiri, disimpan secara privat dan dihapus bila aplikasi dilepas dari akun itu. Tidak pernah mengakses atau memposting dari akun pengunjung. Posting ke X mungkin ditambahkan nanti." },
      { h: "Hosting dan pihak ketiga", p: "Website ini di-hosting oleh Vercel, sedangkan konten dan gambar dilayani oleh Sanity. Kebijakan privasi mereka berlaku untuk data yang mereka proses untuk menjalankan layanan ini. Link ke WhatsApp, Instagram, Behance, Threads, dan X menuju layanan dengan kebijakan masing-masing." },
      { h: "Pilihanmu", p: "Kamu bisa meminta kami menghapus pesan atau data yang pernah kamu kirim, lewat hello@kineticstudiow.my.id. Halaman ini bisa diperbarui; tanggal di atas menunjukkan versi terbaru." },
    ],
  },
};

export type PrivacyDict = (typeof privacy)["en"];
export default privacy;
