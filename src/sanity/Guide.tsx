"use client";
/** The "Panduan" pane at the top of the Studio: how Fatwa edits the site. */
import { Badge, Box, Card, Container, Flex, Heading, Stack, Text } from "@sanity/ui";

const SITE = "https://www.kineticstudiow.my.id";

const SECTIONS: { title: string; steps: string[] }[] = [
  {
    title: "Tambah maskot premade baru",
    steps: [
      "Buka Produk (maskot premade), lalu klik tombol + (Create) di kanan atas.",
      "Isi Nomor (tiga digit, misalnya 020) dan Nama (huruf kapital, misalnya KOPI KAKEK).",
      "Di Alamat halaman, klik Generate supaya link-nya dibuat otomatis.",
      "Isi Harga (Rp), Harga (USD), dan Harga coret kalau sedang diskon.",
      "Upload Gambar utama, lalu tambahkan Galeri kalau ada.",
      "Klik Publish di kanan bawah.",
    ],
  },
  {
    title: "Tandai maskot terjual",
    steps: ["Buka maskotnya, nyalakan Sudah terjual, lalu Publish.", "Di situs muncul cap TERJUAL, dan tombol order otomatis diganti."],
  },
  {
    title: "Ganti atau tambah foto karya",
    steps: [
      "Buka Karya. Untuk karya baru, klik +; untuk yang lama, pilih karyanya.",
      "Isi Judul, Kategori, dan Deskripsi dalam dua bahasa. Judul yang jelas (misalnya \"Maskot ayam untuk Warung Geprek\") bagus untuk Google.",
      "Ganti Gambar utama atau tambah Galeri, lalu nyalakan Karya asli supaya label placeholder hilang.",
      "Urutan menentukan posisi: 01 tampil paling depan.",
    ],
  },
  {
    title: "Testimoni dan logo klien",
    steps: [
      "Testimoni: isi Kutipan dan Nama dan keterangan, lalu matikan Masih placeholder.",
      "Logo klien: kalau kamu upload Logo, gambar logo asli menggantikan tulisan nama di strip klien.",
    ],
  },
  {
    title: "Tulis di Journal",
    steps: [
      "Buka Journal, klik + di atas daftar.",
      "Isi Judul (English wajib, Indonesia boleh kosong), klik Generate di Alamat halaman, lalu pilih Foto sampul.",
      "Tulis Isi tulisan. Bisa tebal, miring, dan link. Versi Indonesia boleh kosong, nanti memakai versi English.",
      "Opsional: pilih maskot atau karya di Terkait dengan, supaya kartunya muncul di bawah tulisan.",
      "Setelah Publish, buka kolom Bagikan: tombol Post ke X, Threads, LinkedIn, Facebook, WhatsApp, dan Pinterest membuka kotak posting dengan caption dan link sudah terisi. Tinggal tambahkan foto (tombol Unduh foto sampul) lalu kirim. Untuk Instagram, pakai Copy caption Instagram.",
      "Mau otomatis ke Threads? Isi Caption media sosial dan centang Kirim ke Threads (opsional: Teruskan ke Instagram Story). Begitu di-Publish, tulisan terkirim dalam satu sampai dua menit, dan Status Threads menunjukkan link serta angka views/likes-nya. Akun Threads disambungkan sekali di menu Threads.",
      "Klik Publish. Halaman Journal muncul di footer situs begitu ada tulisan pertama.",
    ],
  },
  {
    title: "Edit teks halaman",
    steps: [
      "Buka Teks halaman, lalu pilih halamannya (Beranda, Toko, Tentang, dan lainnya).",
      "Tiap teks punya kolom Indonesia dan English. Kolom yang dikosongkan memakai teks bawaan.",
      "Kata di dalam {kurung kurawal}, seperti {name} atau {price}, jangan diubah atau dihapus: itu diisi otomatis.",
    ],
  },
  {
    title: "Nomor WhatsApp dan template chat",
    steps: [
      "Buka WhatsApp & kontak.",
      "Nomor ditulis dengan format internasional, tanpa + dan spasi: 6285156487036.",
      "Template chat adalah pesan yang otomatis terisi saat pengunjung menekan tombol WhatsApp. Kata dalam {kurung kurawal} juga jangan diubah.",
    ],
  },
];

const TIPS = [
  "Selalu klik Publish. Selama masih draft, perubahan belum tampil di situs.",
  "Setelah Publish, situs ikut berubah dalam beberapa detik. Kalau belum, refresh halamannya.",
  "Mau lihat hasilnya sebelum Publish? Di setiap dokumen ada tab Pratinjau di sebelah Edit. Biar berdampingan: klik ⋯ di kanan atas dokumen → Split pane right, lalu pilih Pratinjau di panel kanan. Perubahan yang belum di-Publish ikut tampil, pengunjung tetap melihat versi lama sampai kamu klik Publish.",
  "Cara lain: menu Pratinjau paling atas membuka situsnya dulu. Klik halaman mana pun di situ, form-nya muncul di sebelah.",
  "Foto: pakai PNG (bisa transparan) atau JPG. Bentuk persegi paling rapi di kartu toko.",
  "Tidak perlu ubah ke WebP sendiri: situs otomatis mengubah foto ke format ringan (WebP/AVIF) dan mengecilkannya untuk pengunjung.",
  "Ukuran ideal 1600–2000 px di sisi terpanjang, maksimal sekitar 10 MB per foto. Foto mentah yang jauh lebih besar tetap bisa, hanya unggahnya lebih lama.",
];

export default function Guide() {
  return (
    <Box padding={4} style={{ overflowY: "auto", height: "100%" }}>
      <Container width={1}>
        <Stack space={5}>
          <Stack space={3}>
            <Heading as="h1" size={3}>Panduan edit website</Heading>
            <Text muted size={2}>
              Semua isi website Kinetic diatur dari sini. Pilih menu di kiri, ubah isinya, lalu klik Publish.
            </Text>
            <Text size={2}>
              <a href={SITE} target="_blank" rel="noopener noreferrer">Buka website ↗</a>
            </Text>
          </Stack>

          {SECTIONS.map((s, i) => (
            <Card key={s.title} padding={4} radius={3} shadow={1} tone="default">
              <Stack space={4}>
                <Flex align="center" gap={3}>
                  <Badge tone="primary" fontSize={1}>{i + 1}</Badge>
                  <Heading as="h2" size={1}>{s.title}</Heading>
                </Flex>
                <Stack space={3} as="ol" style={{ margin: 0, paddingLeft: 20 }}>
                  {s.steps.map((step) => (
                    <Text as="li" key={step} size={1} style={{ lineHeight: 1.6 }}>{step}</Text>
                  ))}
                </Stack>
              </Stack>
            </Card>
          ))}

          <Card padding={4} radius={3} tone="caution" border>
            <Stack space={4}>
              <Heading as="h2" size={1}>Tips</Heading>
              <Stack space={3} as="ul" style={{ margin: 0, paddingLeft: 20 }}>
                {TIPS.map((t) => (
                  <Text as="li" key={t} size={1} style={{ lineHeight: 1.6 }}>{t}</Text>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
