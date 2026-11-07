"use client";
/** On a Journal post: where it stands on Threads (link, numbers, or why it failed). Stores nothing. */
import { useEffect, useState } from "react";
import { useFormValue } from "sanity";
import { Card, Flex, Stack, Text } from "@sanity/ui";

type Social = { threadsId?: string; threadsUrl?: string; sharedAt?: string; threadsError?: string; threadsLock?: string; igStoryStatus?: string };
const LABELS: Record<string, string> = { views: "views", likes: "likes", replies: "reply", reposts: "repost", quotes: "quote" };

export default function ThreadsPostInfo() {
  const social = (useFormValue(["social"]) as Social | undefined) ?? {};
  const on = useFormValue(["shareThreads"]) as boolean | undefined;
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!social.threadsId) return;
    fetch(`/api/threads/insights?ids=${social.threadsId}`).then((r) => r.json()).then((d) => setStats(d?.[social.threadsId!] ?? null)).catch(() => {});
  }, [social.threadsId]);

  if (social.threadsId) {
    return (
      <Card padding={3} radius={2} tone="positive" border>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Sudah di Threads{social.sharedAt ? ` sejak ${new Date(social.sharedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}` : ""}.{" "}
            {social.threadsUrl ? <a href={social.threadsUrl} target="_blank" rel="noopener">Lihat post</a> : null}
          </Text>
          {stats ? (
            <Flex gap={4} wrap="wrap">
              {Object.entries(LABELS).map(([k, l]) => (k in stats ? <Text key={k} size={1}><b>{stats[k].toLocaleString("id-ID")}</b> {l}</Text> : null))}
            </Flex>
          ) : null}
          {social.igStoryStatus ? <Text size={1} muted>Instagram Story: {social.igStoryStatus === "SUCCESS" ? "terkirim" : "gagal (cek Instagram terhubung ke Threads)"}</Text> : null}
        </Stack>
      </Card>
    );
  }
  if (social.threadsError) {
    return <Card padding={3} radius={2} tone="critical" border><Text size={1}>Belum terkirim: {social.threadsError}. Dicoba lagi otomatis setiap hari.</Text></Card>;
  }
  if (social.threadsLock) return <Card padding={3} radius={2} tone="caution" border><Text size={1}>Sedang dikirim ke Threads…</Text></Card>;
  return (
    <Card padding={3} radius={2} border>
      <Text size={1} muted>{on ? "Akan dikirim ke Threads begitu tulisan ini di-Publish." : "Tidak dikirim ke Threads. Centang Kirim ke Threads kalau ingin dikirim."}</Text>
    </Card>
  );
}
