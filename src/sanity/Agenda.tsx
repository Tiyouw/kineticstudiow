"use client";
/**
 * Studio → Agenda: the Journal on a month calendar and a board (Draf / Terjadwal / Terbit).
 * Drag a post to another day on the calendar to reschedule it (same time of day). Click a post to open it,
 * click + on a day to start a new post dated that day.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Stack, Tab, TabList, Text } from "@sanity/ui";
import { dataset, projectId } from "./env";
import { imageUrl } from "./share";

type Raw = { _id: string; title?: { en?: string }; publishedAt?: string; cover?: string; threadsAccounts?: string[]; shared?: number };
type Status = "draft" | "scheduled" | "live";
type Item = { id: string; title: string; date?: Date; status: Status; changed: boolean; cover?: string; threads: number; shared: number; hasDraft: boolean; hasPublished: boolean };

const STATUS: Record<Status, { label: string; tone: "default" | "caution" | "positive"; color: string }> = {
  draft: { label: "Draf", tone: "default", color: "#8690a0" },
  scheduled: { label: "Terjadwal", tone: "caution", color: "#d9a520" },
  live: { label: "Terbit", tone: "positive", color: "#3aa76d" },
};
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const QUERY = `*[_type == "post"]{ _id, title, publishedAt, "cover": cover.asset._ref, threadsAccounts, "shared": count(social.threads[defined(id)]) }`;

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const time = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const fullDate = (d: Date) => d.toLocaleString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Drafts and published copies of the same post, merged into one item. */
function merge(rows: Raw[]): Item[] {
  const by = new Map<string, { draft?: Raw; pub?: Raw }>();
  for (const r of rows) {
    const id = r._id.replace(/^drafts\./, "");
    const e = by.get(id) ?? {};
    if (r._id.startsWith("drafts.")) e.draft = r;
    else e.pub = r;
    by.set(id, e);
  }
  const now = Date.now();
  return [...by.entries()].map(([id, { draft, pub }]) => {
    const r = (draft ?? pub)!;
    const date = r.publishedAt ? new Date(r.publishedAt) : undefined;
    const pubDate = pub?.publishedAt ? new Date(pub.publishedAt).getTime() : 0;
    const status: Status = !pub ? "draft" : pubDate > now ? "scheduled" : "live";
    return { id, title: r.title?.en || "(tanpa judul)", date, status, changed: !!(pub && draft), cover: r.cover, threads: r.threadsAccounts?.length ?? 0, shared: pub?.shared ?? 0, hasDraft: !!draft, hasPublished: !!pub };
  });
}

export default function Agenda() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [view, setView] = useState<"cal" | "board">("cal");
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [flash, setFlash] = useState<{ tone: "positive" | "critical"; text: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const drag = useRef<string | null>(null);

  const load = useCallback(() => {
    client.fetch<Raw[]>(QUERY, {}, { perspective: "raw" }).then((r) => setItems(merge(r))).catch(() => setItems([]));
  }, [client]);

  useEffect(() => {
    load();
    let t: ReturnType<typeof setTimeout> | undefined;
    const sub = client.listen(`*[_type == "post"]`, {}, { visibility: "query" }).subscribe(() => { clearTimeout(t); t = setTimeout(load, 600); });
    return () => { clearTimeout(t); sub.unsubscribe(); };
  }, [client, load]);

  const open = (id: string) => router.navigateIntent("edit", { id, type: "post" });

  const create = async (day: Date) => {
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    const id = crypto.randomUUID();
    try {
      await client.create({ _id: `drafts.${id}`, _type: "post", publishedAt: d.toISOString() });
      open(id);
    } catch (e) {
      setFlash({ tone: "critical", text: `Gagal membuat tulisan: ${e instanceof Error ? e.message : e}` });
    }
  };

  /** Same time of day, new date; both the published copy and an open draft move. */
  const reschedule = async (it: Item, day: Date) => {
    const old = it.date ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), old.getHours(), old.getMinutes());
    if (it.date && dayKey(it.date) === dayKey(d)) return;
    const wasLive = it.status === "live" && d.getTime() > Date.now();
    const msg = `Pindahkan "${it.title}" ke ${fullDate(d)}?` +
      (wasLive ? "\n\nTulisan ini sudah tampil di situs. Kalau dipindah ke tanggal nanti, tulisannya tersembunyi lagi sampai tanggal itu." : "") +
      (it.status !== "draft" && d.getTime() <= Date.now() && it.status === "scheduled" ? "\n\nTanggalnya sudah lewat, jadi tulisan langsung tampil di situs." : "");
    if (!window.confirm(msg)) return;
    try {
      const tx = client.transaction();
      if (it.hasPublished) tx.patch(it.id, (p) => p.set({ publishedAt: d.toISOString() }));
      if (it.hasDraft) tx.patch(`drafts.${it.id}`, (p) => p.set({ publishedAt: d.toISOString() }));
      await tx.commit();
      setFlash({ tone: "positive", text: `"${it.title}" dijadwalkan ${fullDate(d)}.` });
    } catch (e) {
      setFlash({ tone: "critical", text: `Gagal memindah: ${e instanceof Error ? e.message : e}` });
    }
  };

  const byDay = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of items ?? []) if (it.date) { const k = dayKey(it.date); m.set(k, [...(m.get(k) ?? []), it]); }
    for (const list of m.values()) list.sort((a, b) => a.date!.getTime() - b.date!.getTime());
    return m;
  }, [items]);

  // six weeks starting on the Monday on/before the 1st
  const cells = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - ((month.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month]);
  const today = dayKey(new Date());

  const Chip = ({ it }: { it: Item }) => (
    <div
      draggable
      onDragStart={(e: DragEvent) => { drag.current = it.id; e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={() => { drag.current = null; setOver(null); }}
      onClick={() => open(it.id)}
      title={`${it.title}\n${STATUS[it.status].label}${it.changed ? " · ada perubahan belum di-Publish" : ""}${it.date ? `\n${fullDate(it.date)}` : ""}`}
      style={{ cursor: "grab", borderLeft: `3px solid ${STATUS[it.status].color}`, background: "var(--card-muted-bg-color, rgba(127,127,127,.12))", borderRadius: 4, padding: "3px 6px", overflow: "hidden" }}
    >
      <Text size={0} textOverflow="ellipsis" weight="medium">{it.date ? `${time(it.date)} ` : ""}{it.title}</Text>
    </div>
  );

  const Board = () => {
    const cols: Status[] = ["draft", "scheduled", "live"];
    const sorted = (s: Status) => (items ?? []).filter((i) => i.status === s).sort((a, b) =>
      s === "live" ? (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) : (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity));
    return (
      <Grid columns={[1, 1, 3]} gap={3}>
        {cols.map((s) => {
          const list = sorted(s);
          return (
            <Card key={s} padding={3} radius={3} tone="transparent" border>
              <Stack space={3}>
                <Flex align="center" gap={2}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: STATUS[s].color, display: "inline-block" }} />
                  <Text weight="semibold">{STATUS[s].label}</Text>
                  <Badge fontSize={0}>{list.length}</Badge>
                </Flex>
                {s === "draft" ? <Text size={1} muted>Belum pernah di-Publish.</Text> : s === "scheduled" ? <Text size={1} muted>Sudah di-Publish, tampil di situs pada tanggalnya.</Text> : <Text size={1} muted>Sudah tampil di situs.</Text>}
                {list.slice(0, s === "live" ? 20 : 100).map((it) => {
                  const thumb = imageUrl(it.cover, projectId, dataset, 160);
                  return (
                    <Card key={it.id} padding={2} radius={2} shadow={1} style={{ cursor: "pointer" }} onClick={() => open(it.id)}>
                      <Flex gap={3} align="center">
                        {thumb ? <img src={thumb} alt="" width={48} height={48} style={{ objectFit: "cover", borderRadius: 4, flex: "none" }} /> : <Box style={{ width: 48, height: 48, borderRadius: 4, background: "rgba(127,127,127,.15)", flex: "none" }} />}
                        <Stack space={2} flex={1}>
                          <Text size={1} weight="semibold" textOverflow="ellipsis">{it.title}</Text>
                          <Text size={0} muted>{it.date ? fullDate(it.date) : "Belum diberi tanggal"}</Text>
                          <Flex gap={1} wrap="wrap">
                            {it.changed ? <Badge tone="caution" fontSize={0}>Perubahan belum di-Publish</Badge> : null}
                            {it.threads ? <Badge tone={it.shared >= it.threads ? "positive" : "primary"} fontSize={0}>Threads {it.shared}/{it.threads}</Badge> : null}
                          </Flex>
                        </Stack>
                      </Flex>
                    </Card>
                  );
                })}
                {list.length > 20 && s === "live" ? <Text size={0} muted>…dan {list.length - 20} lainnya di menu Journal.</Text> : null}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box padding={4} style={{ overflowY: "auto", height: "100%" }}>
      <Stack space={4}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Heading as="h1" size={3}>Agenda Journal</Heading>
          <TabList space={1}>
            <Tab id="tab-cal" aria-controls="agenda-panel" label="Kalender" selected={view === "cal"} onClick={() => setView("cal")} />
            <Tab id="tab-board" aria-controls="agenda-panel" label="Kanban" selected={view === "board"} onClick={() => setView("board")} />
          </TabList>
        </Flex>
        <Flex gap={3} wrap="wrap">
          {(Object.keys(STATUS) as Status[]).map((s) => (
            <Flex key={s} align="center" gap={2}><span style={{ width: 10, height: 10, borderRadius: 99, background: STATUS[s].color, display: "inline-block" }} /><Text size={1}>{STATUS[s].label}</Text></Flex>
          ))}
          <Text size={1} muted>Mau menjadwalkan? Isi Tanggal terbit nanti, lalu Publish.</Text>
        </Flex>
        {flash ? <Card padding={3} radius={2} tone={flash.tone}><Text size={1}>{flash.text}</Text></Card> : null}

        <div id="agenda-panel">
          {items === null ? <Text muted>Memuat…</Text> : view === "board" ? <Board /> : (
            <Stack space={3}>
              <Flex align="center" gap={2}>
                <Button mode="ghost" text="‹" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
                <Button mode="ghost" text="Hari ini" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }} />
                <Button mode="ghost" text="›" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
                <Text weight="semibold" size={2}>{month.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</Text>
              </Flex>
              <Text size={1} muted>Geser tulisan ke hari lain untuk mengubah jadwalnya. Klik tulisan untuk membukanya, atau + untuk menulis di hari itu.</Text>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
                {DAYS.map((d) => <Box key={d} paddingY={1}><Text size={1} muted align="center">{d}</Text></Box>)}
                {cells.map((day) => {
                  const k = dayKey(day);
                  const inMonth = day.getMonth() === month.getMonth();
                  const list = byDay.get(k) ?? [];
                  return (
                    <Card
                      key={k}
                      padding={1}
                      radius={2}
                      border
                      tone={over === k ? "primary" : k === today ? "positive" : "default"}
                      style={{ minHeight: 96, opacity: inMonth ? 1 : 0.5 }}
                      onDragOver={(e: DragEvent) => { if (drag.current) { e.preventDefault(); setOver(k); } }}
                      onDragLeave={() => setOver((o) => (o === k ? null : o))}
                      onDrop={(e: DragEvent) => {
                        e.preventDefault();
                        setOver(null);
                        const it = items.find((i) => i.id === drag.current);
                        drag.current = null;
                        if (it) reschedule(it, day);
                      }}
                    >
                      <Stack space={1}>
                        <Flex align="center" justify="space-between">
                          <Text size={1} weight={k === today ? "bold" : "regular"}>{day.getDate()}</Text>
                          <Button mode="bleed" fontSize={0} padding={1} text="+" title="Tulisan baru di hari ini" onClick={() => create(day)} />
                        </Flex>
                        {list.map((it) => <Chip key={it.id} it={it} />)}
                      </Stack>
                    </Card>
                  );
                })}
              </div>
            </Stack>
          )}
        </div>
      </Stack>
    </Box>
  );
}
