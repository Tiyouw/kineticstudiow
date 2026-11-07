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
  "Foto: pakai PNG (bisa transparan) atau JPG. Bentuk persegi paling rapi di kartu toko.",
  "Ukuran foto cukup sekitar 1500–2500 px di sisi terpanjang. Sistem otomatis mengecilkan untuk pengunjung.",
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
