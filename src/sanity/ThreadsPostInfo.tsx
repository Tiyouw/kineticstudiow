"use client";
/** On a Journal post: where it stands on each Threads account (link, numbers, or why it failed). Stores nothing. */
import { useEffect, useState } from "react";
import { useFormValue } from "sanity";
import { Card, Flex, Stack, Text } from "@sanity/ui";

type Share = { account: string; username?: string; id?: string; url?: string; sharedAt?: string; error?: string; igStoryStatus?: string };
const LABELS: Record<string, string> = { views: "views", likes: "likes", replies: "reply", reposts: "repost", quotes: "quote" };

export default function ThreadsPostInfo() {
  const social = (useFormValue(["social"]) as { threads?: Share[]; threadsLock?: string } | undefined) ?? {};
  const ticked = ((useFormValue(["threadsAccounts"]) as string[] | undefined) ?? []).filter(Boolean);
  const shares = social.threads ?? [];
  const ids = shares.map((s) => s.id).filter(Boolean).join(",");
  const [stats, setStats] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!ids) return;
    fetch(`/api/threads/insights?ids=${ids}`).then((r) => r.json()).then((d) => setStats(d ?? {})).catch(() => {});
  }, [ids]);

  const waiting = ticked.filter((id) => !shares.some((s) => s.account === id && s.id));

  if (!ticked.length && !shares.length) {
    return <Card padding={3} radius={2} border><Text size={1} muted>Tidak dikirim ke Threads: tulisan ini hanya terbit di website.</Text></Card>;
  }
  return (
    <Stack space={2}>
      {shares.map((s) => (
        <Card key={s.account} padding={3} radius={2} border tone={s.id ? "positive" : "critical"}>
          <Stack space={3}>
            {s.id ? (
              <Text size={1} weight="semibold">
                @{s.username ?? s.account}: terkirim{s.sharedAt ? ` ${new Date(s.sharedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}` : ""}.{" "}
                {s.url ? <a href={s.url} target="_blank" rel="noopener">Lihat post</a> : null}
              </Text>
            ) : (
              <Text size={1}>@{s.username ?? s.account}: belum terkirim, {s.error}. Dicoba lagi otomatis setiap hari.</Text>
            )}
            {s.id && stats[s.id] ? (
              <Flex gap={4} wrap="wrap">
                {Object.entries(LABELS).map(([k, l]) => (k in stats[s.id!] ? <Text key={k} size={1}><b>{stats[s.id!][k].toLocaleString("id-ID")}</b> {l}</Text> : null))}
              </Flex>
            ) : null}
            {s.igStoryStatus ? <Text size={1} muted>Instagram Story: {s.igStoryStatus === "SUCCESS" ? "terkirim" : "gagal (cek Instagram terhubung ke Threads)"}</Text> : null}
          </Stack>
        </Card>
      ))}
      {waiting.filter((id) => !shares.some((s) => s.account === id)).length ? (
        <Card padding={3} radius={2} border tone="caution">
          <Text size={1}>{social.threadsLock ? "Sedang dikirim ke Threads…" : "Akan dikirim ke akun yang dicentang begitu tulisan ini di-Publish."}</Text>
        </Card>
      ) : null}
    </Stack>
  );
}
