"use client";
/** Studio → Threads: the connected Threads accounts, add another, or disconnect one. */
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { useClient } from "sanity";
import { Box, Button, Card, Flex, Heading, Stack, Text } from "@sanity/ui";
import type { ThreadsAccountStatus } from "./ThreadsAccountsInput";

type Status = { configured: boolean; accounts: ThreadsAccountStatus[] };

const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function ThreadsPane() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [s, setS] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ tone: "positive" | "critical"; text: string } | null>(null);

  const load = useCallback(() => {
    fetch("/api/threads/status", { cache: "no-store" }).then((r) => r.json()).then(setS).catch(() => setS(null));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("ok")) setFlash({ tone: "positive", text: `Tersambung${q.get("user") ? ` sebagai @${q.get("user")}` : ""}.` });
    else if (q.get("error")) setFlash({ tone: "critical", text: q.get("error") ?? "Gagal menyambungkan." });
    load();
    // the account may be connected in another tab (see connect below): refresh when the editor comes back
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [load]);

  // Threads refuses to load inside a frame, and the Studio is often opened framed in the sanity.io dashboard:
  // there, open the login in a new tab instead of inside the frame
  const connect = (e: MouseEvent) => {
    if (window.top === window.self) return;
    e.preventDefault();
    window.open("/api/threads/connect", "_blank", "noopener");
  };

  const disconnect = async (a: ThreadsAccountStatus) => {
    if (!window.confirm(`Putuskan @${a.username ?? a.id}? Tulisan baru tidak akan dikirim ke akun ini lagi. Post yang sudah terkirim tetap ada di Threads.`)) return;
    setBusy(a.id);
    try {
      try {
        // with the editor's own session
        await client.delete(`secrets.threads.${a.id}`);
      } catch {
        // the session couldn't touch the private doc: prove membership with a request doc, the server does the rest
        const id = `threadsDisconnect-${crypto.randomUUID()}`;
        await client.create({ _id: id, _type: "threadsDisconnect", account: a.id });
        const r = await fetch("/api/threads/disconnect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request: id }) });
        if (!r.ok) throw new Error(`Server menolak (${r.status})`);
      }
      setFlash({ tone: "positive", text: `@${a.username ?? a.id} sudah diputus.` });
      load();
    } catch (e) {
      setFlash({ tone: "critical", text: `Gagal memutus: ${e instanceof Error ? e.message : e}` });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box padding={4} style={{ maxWidth: 680 }}>
      <Stack space={4}>
        <Heading size={2}>Threads</Heading>
        {flash ? <Card padding={3} radius={2} tone={flash.tone}><Text>{flash.text}</Text></Card> : null}

        {!s ? <Text>Memeriksa…</Text>
          : !s.configured ? <Card padding={4} radius={2} border tone="caution"><Text>Aplikasi Threads belum dikonfigurasi. Tiyo perlu memasang App Secret dulu.</Text></Card>
          : (
            <Stack space={3}>
              {s.accounts.length ? s.accounts.map((a) => (
                <Card key={a.id} padding={4} radius={2} border tone={a.connected && !a.lastError ? "positive" : "caution"}>
                  <Flex align="center" gap={3} wrap="wrap">
                    <Stack space={2} flex={1}>
                      <Text weight="semibold">@{a.username ?? a.id}</Text>
                      {a.expiresAt ? <Text size={1} muted>Akses berlaku sampai {date(a.expiresAt)}, diperpanjang otomatis setiap hari.</Text> : <Text size={1} muted>Perlu disambungkan ulang.</Text>}
                      {a.lastError ? <Text size={1}>Kendala terakhir: {a.lastError}</Text> : null}
                    </Stack>
                    <Button mode="ghost" tone="critical" text={busy === a.id ? "Memutus…" : "Putuskan"} disabled={!!busy} onClick={() => disconnect(a)} />
                  </Flex>
                </Card>
              )) : <Card padding={4} radius={2} border tone="caution"><Text>Belum ada akun Threads tersambung.</Text></Card>}
              <Box>
                <Button as="a" href="/api/threads/connect" onClick={connect} tone="primary" text={s.accounts.length ? "Tambah akun Threads" : "Sambungkan Threads"} />
              </Box>
            </Stack>
          )}

        <Stack space={3}>
          <Text weight="semibold">Menambah akun</Text>
          <Text size={1}>Threads menyambungkan akun yang sedang login di threads.com pada browser ini. Untuk menambah akun lain, logout atau ganti akun di threads.com dulu, lalu klik Tambah akun Threads. Menyambungkan ulang akun yang sama hanya memperbarui aksesnya.</Text>
          <Text size={1}>Selama aplikasinya masih mode development, setiap akun harus diundang dulu sebagai Threads Tester (Meta Developer → App roles → Roles → Threads Tester) dan menerima undangannya di app Threads: Settings → Account → Website permissions → Invites.</Text>
        </Stack>

        <Stack space={3}>
          <Text weight="semibold">Cara kerjanya</Text>
          <Text size={1}>Journal tetap jalan sendiri sebagai blog website. Threads hanya tambahan: tidak ada yang dikirim kecuali kamu mencentang akun di tulisan itu.</Text>
          <Text size={1}>1. Di tulisan Journal, isi Caption media sosial, lalu centang akun mana saja di Kirim ke Threads.</Text>
          <Text size={1}>2. Klik Publish. Dalam satu sampai dua menit tulisan terkirim ke tiap akun yang dicentang: foto sampul (dan galeri sebagai carousel), caption, dan link ke tulisan.</Text>
          <Text size={1}>3. Link post dan angka views/likes per akun muncul di tulisan itu. Kalau gagal, sistem mencoba lagi setiap hari dan alasannya tampil di sini.</Text>
          <Text size={1}>Tiap tulisan hanya dikirim sekali per akun. Mengedit tulisan setelah terkirim tidak mengubah post di Threads.</Text>
          <Text size={1}>Putuskan menghapus akses yang disimpan website. Untuk mencabut sepenuhnya, pemilik akun juga bisa menghapus aplikasinya di Threads: Settings → Account → Website permissions.</Text>
        </Stack>
      </Stack>
    </Box>
  );
}
