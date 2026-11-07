"use client";
/** "Kirim ke Threads" on a Journal post: one checkbox per connected Threads account. Stores their Threads user ids. */
import { useEffect, useState } from "react";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import { Card, Checkbox, Flex, Stack, Text } from "@sanity/ui";

export type ThreadsAccountStatus = { id: string; username: string | null; connected: boolean; expiresAt: string | null; lastError: string | null };

export default function ThreadsAccountsInput(props: ArrayOfPrimitivesInputProps) {
  const value = ((props.value as string[] | undefined) ?? []).filter(Boolean);
  const [accounts, setAccounts] = useState<ThreadsAccountStatus[] | null>(null);

  useEffect(() => {
    fetch("/api/threads/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAccounts(d?.accounts ?? []))
      .catch(() => setAccounts([]));
  }, []);

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...new Set([...value, id])] : value.filter((v) => v !== id);
    props.onChange(next.length ? set(next) : unset());
  };

  if (!accounts) return <Text size={1} muted>Memuat akun Threads…</Text>;
  // ticked accounts that were disconnected since: still listed, so they can be unticked
  const gone = value.filter((id) => !accounts.some((a) => a.id === id));
  if (!accounts.length && !gone.length) {
    return <Card padding={3} radius={2} border tone="transparent"><Text size={1} muted>Belum ada akun Threads tersambung. Sambungkan di menu Threads.</Text></Card>;
  }
  return (
    <Stack space={3}>
      {accounts.map((a) => (
        <Flex key={a.id} align="center" gap={3} as="label" style={{ cursor: a.connected ? "pointer" : "default" }}>
          <Checkbox checked={value.includes(a.id)} disabled={props.readOnly || !a.connected} onChange={(e) => toggle(a.id, e.currentTarget.checked)} />
          <Text size={1}>@{a.username ?? a.id}{a.connected ? "" : " (perlu disambungkan ulang)"}</Text>
        </Flex>
      ))}
      {gone.map((id) => (
        <Flex key={id} align="center" gap={3} as="label" style={{ cursor: "pointer" }}>
          <Checkbox checked onChange={() => toggle(id, false)} disabled={props.readOnly} />
          <Text size={1} muted>Akun yang sudah diputus ({id}): hapus centangnya</Text>
        </Flex>
      ))}
      <Text size={1} muted>Tidak ada yang dicentang = tulisan hanya terbit di website.</Text>
    </Stack>
  );
}
