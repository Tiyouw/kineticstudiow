"use client";
/** Studio → Threads: is Kinetic's Threads account connected, and a button to (re)connect it. */
import { useEffect, useState } from "react";
import { Box, Button, Card, Heading, Stack, Text } from "@sanity/ui";

type Status = { configured: boolean; connected: boolean; username: string | null; expiresAt: string | null; lastError: string | null };

const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function ThreadsPane() {
  const [s, setS] = useState<Status | null>(null);
  const [flash, setFlash] = useState<{ tone: "positive" | "critical"; text: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("ok")) setFlash({ tone: "positive", text: `Tersambung${q.get("user") ? ` sebagai @${q.get("user")}` : ""}.` });
    else if (q.get("error")) setFlash({ tone: "critical", text: q.get("error") ?? "Gagal menyambungkan." });
    fetch("/api/threads/status", { cache: "no-store" }).then((r) => r.json()).then(setS).catch(() => setS(null));
  }, []);

  return (
    <Box padding={4} style={{ maxWidth: 640 }}>
      <Stack space={4}>
        <Heading size={2}>Threads</Heading>
        {flash ? <Card padding={3} radius={2} tone={flash.tone}><Text>{flash.text}</Text></Card> : null}

        <Card padding={4} radius={2} border tone={s?.connected ? "positive" : "caution"}>
          <Stack space={3}>
            {!s ? <Text>Memeriksa…</Text>
              : !s.configured ? <Text>Aplikasi Threads belum dikonfigurasi. Tiyo perlu memasang App Secret dulu.</Text>
              : s.connected ? (
                <>
                  <Text weight="semibold">Tersambung sebagai @{s.username}</Text>
                  {s.expiresAt ? <Text size={1} muted>Akses berlaku sampai {date(s.expiresAt)}, dan diperpanjang otomatis setiap hari.</Text> : null}
                </>
              ) : <Text>Belum tersambung. Klik tombol di bawah, login ke Threads (akun Kinetic), lalu klik Izinkan.</Text>}
            {s?.configured ? (
              <Box>
                <Button as="a" href="/api/threads/connect" tone="primary" text={s.connected ? "Sambungkan ulang" : "Sambungkan Threads"} />
              </Box>
            ) : null}
          </Stack>
        </Card>

        {s?.lastError ? (
          <Card padding={3} radius={2} tone="critical" border>
            <Stack space={2}>
              <Text size={1} weight="semibold">Kendala terakhir</Text>
              <Text size={1}>{s.lastError}</Text>
            </Stack>
          </Card>
        ) : null}

        <Stack space={3}>
          <Text weight="semibold">Cara kerjanya</Text>
          <Text size={1}>1. Di tulisan Journal, isi Caption media sosial dan centang Kirim ke Threads.</Text>
          <Text size={1}>2. Klik Publish. Dalam satu sampai dua menit tulisan terkirim ke Threads: foto sampul (dan galeri sebagai carousel), caption, dan link ke tulisan.</Text>
          <Text size={1}>3. Link post Threads dan angka views/likes muncul di tulisan itu. Kalau gagal, sistem mencoba lagi setiap hari dan alasannya tampil di sini.</Text>
          <Text size={1}>Centang Teruskan ke Instagram Story kalau ingin post yang sama juga muncul sebagai Story (24 jam) di Instagram yang terhubung dengan Threads.</Text>
          <Text size={1}>Tiap tulisan hanya dikirim sekali. Mengedit tulisan setelah terkirim tidak mengubah post di Threads.</Text>
        </Stack>
      </Stack>
    </Box>
  );
}
