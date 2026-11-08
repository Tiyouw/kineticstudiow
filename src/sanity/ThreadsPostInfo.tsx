"use client";
/**
 * On a Journal post: where it stands on each Threads account (link, numbers, or why it failed), plus "Kirim ulang"
 * (a typo: Threads posts can't be edited, so the old one is deleted and the published version sent again) and
 * "Hapus dari Threads". The actions go through /api/threads/action; this field itself stores nothing.
 */
import { useCallback, useEffect, useState } from "react";
import { useClient, useEditState, useFormValue } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";

type Share = { account: string; username?: string; id?: string; url?: string; sharedAt?: string; error?: string; igStoryStatus?: string; removedAt?: string };
const LABELS: Record<string, string> = { views: "views", likes: "likes", replies: "reply", reposts: "repost", quotes: "quote" };
const when = (s: string) => new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function ThreadsPostInfo() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const docId = String(useFormValue(["_id"]) ?? "").replace(/^drafts\./, "");
  const edit = useEditState(docId, "post");
  const social = (useFormValue(["social"]) as { threads?: Share[]; threadsLock?: string } | undefined) ?? {};
  const ticked = ((useFormValue(["threadsAccounts"]) as string[] | undefined) ?? []).filter(Boolean);
  const shares = social.threads ?? [];
  const ids = shares.filter((s) => s.id && !s.removedAt).map((s) => s.id).join(",");
  const [stats, setStats] = useState<Record<string, Record<string, number>>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ tone: "positive" | "critical"; text: string } | null>(null);

  const loadStats = useCallback(() => {
    if (!ids) return;
    fetch(`/api/threads/insights?ids=${ids}`, { cache: "no-store" }).then((r) => r.json()).then((d) => setStats(d ?? {})).catch(() => {});
  }, [ids]);
  useEffect(loadStats, [loadStats]);

  const hasDraft = !!edit.draft;
  const isPublished = !!edit.published;

  const act = async (s: Share, action: "resend" | "takedown") => {
    const name = `@${s.username ?? s.account}`;
    const gone = !!s.removedAt || (!!s.id && !!stats[s.id]?.gone);
    const ask = action === "takedown"
      ? `Hapus post ini dari Threads ${name}? Instagram Story-nya ikut hilang. Tulisan di website tetap ada.`
      : `${s.id && !gone ? `Post lama di ${name} dihapus dulu (views/likes-nya ikut hilang), lalu ` : ""}versi yang sudah di-Publish dikirim lagi ke ${name}. Lanjut?`;
    if (!window.confirm(ask)) return;
    setBusy(s.account);
    setFlash(null);
    try {
      const id = `threadsAction-${crypto.randomUUID()}`;
      await client.create({ _id: id, _type: "threadsAction", action, post: docId, account: s.account });
      const r = await fetch("/api/threads/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request: id }) });
      const body = (await r.json().catch(() => ({}))) as { message?: string };
      if (!r.ok) throw new Error(body.message ?? `Server menolak (${r.status})`);
      setFlash({ tone: "positive", text: action === "takedown" ? `Sudah dihapus dari ${name}.` : `Terkirim ulang ke ${name}.` });
    } catch (e) {
      setFlash({ tone: "critical", text: `Gagal: ${e instanceof Error ? e.message : e}` });
    } finally {
      setBusy(null);
    }
  };

  const waiting = ticked.filter((id) => !shares.some((s) => s.account === id));

  if (!ticked.length && !shares.length) {
    return <Card padding={3} radius={2} border><Text size={1} muted>Tidak dikirim ke Threads: tulisan ini hanya terbit di website.</Text></Card>;
  }
  return (
    <Stack space={2}>
      {flash ? <Card padding={3} radius={2} tone={flash.tone}><Text size={1}>{flash.text}</Text></Card> : null}
      {shares.map((s) => {
        const name = `@${s.username ?? s.account}`;
        const gone = !!s.removedAt || (!!s.id && !!stats[s.id]?.gone);
        const live = !!s.id && !gone;
        const st = s.id ? stats[s.id] : undefined;
        return (
          <Card key={s.account} padding={3} radius={2} border tone={live ? "positive" : gone ? "caution" : "critical"}>
            <Stack space={3}>
              {live ? (
                <Text size={1} weight="semibold">
                  {name}: terkirim{s.sharedAt ? ` ${when(s.sharedAt)}` : ""}.{" "}
                  {s.url ? <a href={s.url} target="_blank" rel="noopener">Lihat post</a> : null}
                </Text>
              ) : gone ? (
                <Text size={1}>{name}: post-nya sudah dihapus dari Threads{s.removedAt ? ` (${when(s.removedAt)})` : ""}. Tidak akan dikirim lagi kecuali kamu klik Kirim ulang.</Text>
              ) : (
                <Text size={1}>{name}: belum terkirim, {s.error}. Dicoba lagi otomatis setiap hari.</Text>
              )}
              {live && st && !st.gone ? (
                <Flex gap={4} wrap="wrap">
                  {Object.entries(LABELS).map(([k, l]) => (k in st ? <Text key={k} size={1}><b>{st[k].toLocaleString("id-ID")}</b> {l}</Text> : null))}
                </Flex>
              ) : null}
              {live && s.igStoryStatus ? <Text size={1} muted>Instagram Story: {s.igStoryStatus === "SUCCESS" ? "terkirim" : "gagal (cek Instagram terhubung ke Threads)"}</Text> : null}
              <Flex gap={2} wrap="wrap" align="center">
                <Button
                  mode="ghost" fontSize={1} padding={2}
                  text={busy === s.account ? "Memproses… (bisa sampai 1 menit)" : live ? "Kirim ulang" : gone ? "Kirim ulang" : "Coba kirim sekarang"}
                  disabled={!!busy || hasDraft || !isPublished}
                  onClick={() => act(s, "resend")}
                />
                {live ? <Button mode="ghost" tone="critical" fontSize={1} padding={2} text="Hapus dari Threads" disabled={!!busy} onClick={() => act(s, "takedown")} /> : null}
              </Flex>
              {hasDraft ? <Text size={1} muted>Ada perubahan yang belum di-Publish. Publish dulu, baru Kirim ulang, supaya yang terkirim versi terbaru.</Text> : null}
            </Stack>
          </Card>
        );
      })}
      {waiting.length ? (
        <Card padding={3} radius={2} border tone="caution">
          <Text size={1}>{social.threadsLock ? "Sedang dikirim ke Threads…" : "Akan dikirim ke akun yang dicentang begitu tulisan ini di-Publish."}</Text>
        </Card>
      ) : null}
      <Text size={1} muted>Post Threads tidak bisa diedit. Kalau ada typo: perbaiki tulisannya, Publish, lalu klik Kirim ulang.</Text>
    </Stack>
  );
}
