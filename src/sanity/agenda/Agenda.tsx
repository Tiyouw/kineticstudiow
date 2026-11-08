"use client";
/**
 * Studio → Agenda: the Journal as a list (default on phones), a month calendar and a board
 * (Ide → Draf → Siap → Terjadwal → Terbit). Add posts without leaving, schedule or queue them into fixed slots.
 * Every move is in each card's ⋯ menu (touch); on a desktop cards can also be dragged.
 */
import { useCallback, useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { Badge, Box, Button, Card, Flex, Heading, Stack, Tab, TabList, Text, useMediaIndex, useToast } from "@sanity/ui";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "@sanity/icons";
import {
  QUERY, STAGE, STAGES, createPost, dayKey, fmtDay, fmtTime, merge, nextFreeSlot, publishAt, setDate, setStage, slotsOn, takenAt,
  type Doc, type Item, type Slot, type Stage,
} from "./model";
import { DateDialog, Dot, ItemCard, QuickAdd, SlotGhost, SlotsDialog, type Act } from "./parts";

type View = "list" | "cal" | "board";

function Section({ title, count, children, tone }: { title: string; count?: number; children: ReactNode; tone?: "caution" }) {
  return (
    <Stack space={2}>
      <Flex align="center" gap={2}>
        <Text size={1} weight="bold" style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>{title}</Text>
        {count !== undefined ? <Badge tone={tone ?? "default"} fontSize={0}>{count}</Badge> : null}
      </Flex>
      {children}
    </Stack>
  );
}
const VIEW_KEY = "kinetic-agenda-view";
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const readView = (): View | null => { try { const v = localStorage.getItem(VIEW_KEY); return v === "list" || v === "cal" || v === "board" ? v : null; } catch { return null; } };
const saveView = (v: View) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ } };

export default function Agenda() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const router = useRouter();
  const toast = useToast();
  const media = useMediaIndex();
  const compact = media < 3; // under ~900px: phones and small tablets
  const [items, setItems] = useState<Item[] | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [view, setViewState] = useState<View | null>(null);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [picked, setPicked] = useState(() => dayKey(new Date()));
  const [boardCol, setBoardCol] = useState<Stage>("draft");
  const [adding, setAdding] = useState<{ at?: Date } | null>(null);
  const [dating, setDating] = useState<{ it: Item; mode: "schedule" | "date" } | null>(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [over, setOver] = useState<string | null>(null);

  const v: View = view ?? readView() ?? (compact ? "list" : "cal");
  const setView = (x: View) => { setViewState(x); saveView(x); };

  const load = useCallback(() => {
    client.fetch<Doc[]>(QUERY, {}, { perspective: "raw" }).then((r) => setItems(merge(r))).catch(() => setItems([]));
    client.fetch<{ slots?: Slot[] } | null>(`*[_id == "agendaSettings"][0]{slots}`).then((s) => setSlots(s?.slots ?? [])).catch(() => {});
  }, [client]);

  useEffect(() => {
    load();
    let t: ReturnType<typeof setTimeout> | undefined;
    const sub = client.listen(`*[_type == "post" || _id == "agendaSettings"]`, {}, { visibility: "query" }).subscribe(() => { clearTimeout(t); t = setTimeout(load, 500); });
    return () => { clearTimeout(t); sub.unsubscribe(); };
  }, [client, load]);

  const all = useMemo(() => items ?? [], [items]);
  const ok = (title: string) => toast.push({ status: "success", title });
  const fail = (e: unknown) => toast.push({ status: "error", title: e instanceof Error ? e.message : String(e), duration: 8000 });
  const open = (id: string) => router.navigateIntent("edit", { id, type: "post" });

  const act = async (a: Act, it: Item) => {
    try {
      if (a === "open") return open(it.id);
      if (a === "idea" || a === "draft" || a === "ready") { await setStage(client, it, a); return ok(`Dipindah ke ${STAGE[a].label}.`); }
      if (a === "schedule" || a === "date") return setDating({ it, mode: a });
      if (a === "queue") {
        const at = nextFreeSlot(slots, all, it.id);
        if (!at) return fail(new Error("Tidak ada slot kosong. Atur slot dulu."));
        if (it.hasPublished) { await setDate(client, it, at); return ok(`Dipindah ke ${fmtDay(at)} ${fmtTime(at)}.`); }
        await publishAt(client, it, at);
        return ok(`Dijadwalkan ${fmtDay(at)} ${fmtTime(at)}.`);
      }
      if (a === "now") {
        if (!window.confirm(`Terbitkan "${it.title}" sekarang?`)) return;
        if (it.hasPublished && !it.hasDraft) await setDate(client, it, new Date());
        else await publishAt(client, it, new Date());
        return ok("Terbit. Tampil di situs dalam beberapa detik.");
      }
    } catch (e) {
      fail(e);
    }
  };

  /** Desktop drag: onto a calendar day (same time of day) or a board column. */
  const dropOnDay = async (id: string, day: Date) => {
    const it = all.find((i) => i.id === id);
    if (!it) return;
    const base = it.date ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes());
    if (it.date && dayKey(it.date) === dayKey(at)) return;
    if (it.stage === "live" && at.getTime() > Date.now() && !window.confirm(`"${it.title}" sudah tampil di situs. Pindah ke tanggal nanti berarti tersembunyi lagi sampai ${fmtDay(at)}. Lanjut?`)) return;
    try { await setDate(client, it, at); ok(`Dipindah ke ${fmtDay(at)} ${fmtTime(at)}.`); } catch (e) { fail(e); }
  };
  const dropOnStage = (id: string, s: Stage) => {
    const it = all.find((i) => i.id === id);
    if (!it || it.stage === s) return;
    act(s === "scheduled" ? (it.hasPublished ? "date" : "schedule") : s === "live" ? "now" : s, it);
  };

  const saveNew = async (f: Parameters<typeof createPost>[1], andOpen: boolean) => {
    try {
      const id = await createPost(client, f);
      setAdding(null);
      ok(f.stage === "idea" ? "Ide disimpan." : "Tulisan dibuat.");
      if (andOpen) open(id);
    } catch (e) { fail(e); }
  };

  const confirmDate = async (d: Date) => {
    if (!dating) return;
    const { it, mode } = dating;
    try {
      if (mode === "schedule") await publishAt(client, it, d);
      else await setDate(client, it, d);
      setDating(null);
      ok(mode === "schedule" ? (d.getTime() > Date.now() ? `Dijadwalkan ${fmtDay(d)} ${fmtTime(d)}.` : "Terbit.") : "Tanggal disimpan.");
    } catch (e) { fail(e); }
  };

  /* ---------- derived ---------- */

  const byDay = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of all) if (it.date) m.set(dayKey(it.date), [...(m.get(dayKey(it.date)) ?? []), it]);
    for (const l of m.values()) l.sort((a, b) => a.date!.getTime() - b.date!.getTime());
    return m;
  }, [all]);
  const taken = useMemo(() => takenAt(all), [all]);
  const freeSlotsOn = (day: Date) => slotsOn(day, slots).filter((t) => t.getTime() > Date.now() && !taken.has(t.getTime()));
  const card = (it: Item, drag = false) => <ItemCard key={it.id} it={it} onAct={act} draggable={drag && !compact} hasSlots={slots.length > 0} />;

  /* ---------- list (phones' default) ---------- */

  const listView = () => {
    const now = new Date();
    const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = 86_400_000;
    const notLive = all.filter((i) => i.stage !== "live" && i.stage !== "idea");
    const late = notLive.filter((i) => i.date && i.date.getTime() < now.getTime() && !i.hasPublished);
    const undated = notLive.filter((i) => !i.date);
    const upcoming = notLive.filter((i) => i.date && (i.hasPublished || i.date.getTime() >= now.getTime())).sort((a, b) => a.date!.getTime() - b.date!.getTime());
    const ideas = all.filter((i) => i.stage === "idea");
    const recent = all.filter((i) => i.stage === "live").sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)).slice(0, 5);

    // the next 14 days, each with its posts and empty slots
    const days = Array.from({ length: 14 }, (_, i) => new Date(today0 + i * day));
    const later = upcoming.filter((i) => i.date!.getTime() >= today0 + 14 * day);

    return (
      <Stack space={5}>
        {late.length ? <Section title="Lewat tanggal, belum di-Publish" count={late.length} tone="caution">{late.map((i) => card(i))}</Section> : null}
        <Section title="14 hari ke depan">
          <Stack space={3}>
            {days.map((d) => {
              const list = byDay.get(dayKey(d)) ?? [];
              const free = freeSlotsOn(d);
              if (!list.length && !free.length) return null;
              return (
                <Stack key={dayKey(d)} space={2}>
                  <Text size={1} muted weight="semibold">{d.getTime() === today0 ? "Hari ini" : d.getTime() === today0 + day ? "Besok" : fmtDay(d)}</Text>
                  {list.map((i) => card(i))}
                  {free.map((t) => <SlotGhost key={t.getTime()} at={t} onAdd={(at) => setAdding({ at })} label={`Slot kosong ${fmtTime(t)} · isi`} />)}
                </Stack>
              );
            })}
            {!days.some((d) => (byDay.get(dayKey(d)) ?? []).length || freeSlotsOn(d).length) ? (
              <Text size={1} muted>{slots.length ? "Belum ada yang dijadwalkan." : "Belum ada yang dijadwalkan. Atur slot posting supaya hari kosong kelihatan."}</Text>
            ) : null}
          </Stack>
        </Section>
        {later.length ? <Section title="Nanti" count={later.length}>{later.map((i) => card(i))}</Section> : null}
        {undated.length ? <Section title="Belum diberi tanggal" count={undated.length}>{undated.map((i) => card(i))}</Section> : null}
        <Section title="Ide" count={ideas.length}>
          {ideas.map((i) => card(i))}
          <Box><Button mode="ghost" icon={AddIcon} text="Catat ide" onClick={() => setAdding({})} /></Box>
        </Section>
        {recent.length ? <Section title="Baru terbit">{recent.map((i) => card(i))}</Section> : null}
      </Stack>
    );
  };

  /* ---------- month calendar ---------- */

  const cells = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - ((month.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month]);
  const today = dayKey(new Date());

  const calView = () => {
    const sel = cells.find((c) => dayKey(c) === picked) ?? new Date();
    const selList = byDay.get(dayKey(sel)) ?? [];
    const selFree = freeSlotsOn(sel);
    return (
      <Stack space={3}>
        <Flex align="center" gap={1}>
          <Button mode="bleed" icon={ChevronLeftIcon} aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
          <Box flex={1}><Text weight="semibold" size={2} align="center">{month.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</Text></Box>
          <Button mode="bleed" icon={ChevronRightIcon} aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
          <Button mode="ghost" fontSize={1} text="Hari ini" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setPicked(dayKey(d)); }} />
        </Flex>
        {!compact ? <Text size={1} muted>Geser tulisan ke hari lain untuk memindah jadwalnya. Kotak putus-putus = slot kosong.</Text> : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: compact ? 2 : 4 }}>
          {DAYS.map((d) => <Box key={d} paddingY={1}><Text size={0} muted align="center">{d}</Text></Box>)}
          {cells.map((day) => {
            const k = dayKey(day);
            const inMonth = day.getMonth() === month.getMonth();
            const list = byDay.get(k) ?? [];
            const free = freeSlotsOn(day);
            if (compact) {
              // phones: a tappable number with coloured dots; the day's posts show below the grid
              return (
                <Card key={k} padding={1} radius={2} tone={k === picked ? "primary" : k === today ? "positive" : "default"} border={k === picked}
                  style={{ minHeight: 48, opacity: inMonth ? 1 : 0.45, cursor: "pointer" }} onClick={() => setPicked(k)}>
                  <Stack space={2}>
                    <Text size={1} align="center" weight={k === today ? "bold" : "regular"}>{day.getDate()}</Text>
                    <Flex justify="center" gap={1} wrap="wrap">
                      {list.slice(0, 4).map((i) => <Dot key={i.id} stage={i.stage} size={6} />)}
                      {free.length ? <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, border: "1px dashed currentColor", opacity: 0.5 }} /> : null}
                    </Flex>
                  </Stack>
                </Card>
              );
            }
            return (
              <Card key={k} padding={1} radius={2} border tone={over === k ? "primary" : k === today ? "positive" : "default"}
                style={{ minHeight: 110, opacity: inMonth ? 1 : 0.5 }}
                onDragOver={(e: DragEvent) => { e.preventDefault(); setOver(k); }}
                onDragLeave={() => setOver((o) => (o === k ? null : o))}
                onDrop={(e: DragEvent) => { e.preventDefault(); setOver(null); dropOnDay(e.dataTransfer.getData("text/plain"), day); }}>
                <Stack space={1}>
                  <Flex align="center" justify="space-between">
                    <Text size={1} weight={k === today ? "bold" : "regular"}>{day.getDate()}</Text>
                    <Button mode="bleed" fontSize={0} padding={1} icon={AddIcon} title="Tulisan baru di hari ini" onClick={() => setAdding({ at: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0) })} />
                  </Flex>
                  {list.map((it) => (
                    <div key={it.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", it.id); }} onClick={() => open(it.id)}
                      title={`${it.title}\n${STAGE[it.stage].label}`}
                      style={{ cursor: "grab", borderLeft: `3px solid ${STAGE[it.stage].color}`, background: "rgba(127,127,127,.12)", borderRadius: 4, padding: "3px 6px", overflow: "hidden" }}>
                      <Text size={0} textOverflow="ellipsis" weight="medium">{fmtTime(it.date!)} {it.title}</Text>
                    </div>
                  ))}
                  {free.map((t) => (
                    <div key={t.getTime()} onClick={() => setAdding({ at: t })} style={{ cursor: "pointer", border: "1px dashed rgba(127,127,127,.5)", borderRadius: 4, padding: "2px 6px" }}>
                      <Text size={0} muted>{fmtTime(t)} slot</Text>
                    </div>
                  ))}
                </Stack>
              </Card>
            );
          })}
        </div>
        {compact ? (
          <Stack space={2} paddingTop={2}>
            <Text size={1} weight="semibold">{dayKey(sel) === today ? "Hari ini" : fmtDay(sel)}</Text>
            {selList.map((i) => card(i))}
            {selFree.map((t) => <SlotGhost key={t.getTime()} at={t} onAdd={(at) => setAdding({ at })} label={`Slot kosong ${fmtTime(t)} · isi`} />)}
            <SlotGhost at={new Date(sel.getFullYear(), sel.getMonth(), sel.getDate(), 9, 0)} onAdd={(at) => setAdding({ at })} label="Tulisan baru di hari ini" />
          </Stack>
        ) : null}
      </Stack>
    );
  };

  /* ---------- board ---------- */

  const column = (s: Stage) => all.filter((i) => i.stage === s).sort((a, b) =>
    s === "live" ? (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) : (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity));

  const boardView = () => {
    if (compact) {
      const list = column(boardCol);
      return (
        <Stack space={3}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Flex gap={1} style={{ width: "max-content" }}>
              {STAGES.map((s) => (
                <Button key={s} mode={boardCol === s ? "default" : "ghost"} tone={boardCol === s ? "primary" : "default"} fontSize={1} padding={3}
                  onClick={() => setBoardCol(s)} text={`${STAGE[s].label} ${column(s).length}`} />
              ))}
            </Flex>
          </div>
          <Text size={1} muted>{STAGE[boardCol].hint} Pindahkan lewat tombol ⋯ di tiap kartu.</Text>
          {list.length ? list.slice(0, boardCol === "live" ? 30 : 200).map((i) => card(i)) : <Text size={1} muted>Kosong.</Text>}
          {boardCol === "idea" || boardCol === "draft" ? <Box><Button mode="ghost" icon={AddIcon} text={boardCol === "idea" ? "Catat ide" : "Tambah"} onClick={() => setAdding({})} /></Box> : null}
        </Stack>
      );
    }
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${media >= 4 ? 5 : 3}, minmax(0, 1fr))`, gap: 12, overflowX: "auto" }}>
        {STAGES.map((s) => {
          const list = column(s);
          return (
            <Card key={s} padding={2} radius={3} tone={over === s ? "primary" : "transparent"} border
              onDragOver={(e: DragEvent) => { e.preventDefault(); setOver(s); }}
              onDragLeave={() => setOver((o) => (o === s ? null : o))}
              onDrop={(e: DragEvent) => { e.preventDefault(); setOver(null); dropOnStage(e.dataTransfer.getData("text/plain"), s); }}>
              <Stack space={2}>
                <Flex align="center" gap={2} padding={1}>
                  <Dot stage={s} />
                  <Text weight="semibold" size={1}>{STAGE[s].label}</Text>
                  <Badge fontSize={0}>{list.length}</Badge>
                </Flex>
                <Box paddingX={1}><Text size={0} muted>{STAGE[s].hint}</Text></Box>
                {list.slice(0, s === "live" ? 20 : 200).map((i) => card(i, true))}
                {s === "idea" ? <Button mode="bleed" icon={AddIcon} text="Catat ide" fontSize={1} onClick={() => setAdding({})} /> : null}
              </Stack>
            </Card>
          );
        })}
      </div>
    );
  };

  /* ---------- page ---------- */

  return (
    <Box padding={compact ? 3 : 4} style={{ overflowY: "auto", height: "100%" }}>
      <Stack space={4} style={{ maxWidth: v === "list" ? 720 : undefined, margin: "0 auto" }}>
        <Flex align="center" justify="space-between" gap={2} wrap="wrap">
          <Heading as="h1" size={compact ? 2 : 3}>Agenda</Heading>
          <Flex gap={2}>
            <Button mode="ghost" icon={ClockIcon} text={compact ? undefined : slots.length ? `Slot (${slots.length})` : "Atur slot"} aria-label="Atur slot posting" onClick={() => setSlotsOpen(true)} />
            <Button tone="primary" icon={AddIcon} text="Tambah" onClick={() => setAdding({})} />
          </Flex>
        </Flex>
        <TabList space={1}>
          <Tab id="ag-list" aria-controls="ag-panel" label="Daftar" selected={v === "list"} onClick={() => setView("list")} />
          <Tab id="ag-cal" aria-controls="ag-panel" label="Kalender" selected={v === "cal"} onClick={() => setView("cal")} />
          <Tab id="ag-board" aria-controls="ag-panel" label="Kanban" selected={v === "board"} onClick={() => setView("board")} />
        </TabList>
        {!slots.length && items?.length ? (
          <Card padding={3} radius={2} tone="primary" border>
            <Flex align="center" gap={3} wrap="wrap">
              <Box flex={1}><Text size={1}>Atur slot posting rutin (misalnya Selasa & Jumat 09.00), supaya hari kosong kelihatan dan tulisan bisa diantrikan.</Text></Box>
              <Button mode="ghost" fontSize={1} text="Atur slot" onClick={() => setSlotsOpen(true)} />
            </Flex>
          </Card>
        ) : null}
        <div id="ag-panel">
          {items === null ? <Text muted>Memuat…</Text> : v === "list" ? listView() : v === "cal" ? calView() : boardView()}
        </div>
      </Stack>

      {adding ? <QuickAdd at={adding.at} slots={slots} items={all} onClose={() => setAdding(null)} onSave={saveNew} /> : null}
      {dating ? <DateDialog it={dating.it} mode={dating.mode} slots={slots} items={all} onClose={() => setDating(null)} onConfirm={confirmDate} /> : null}
      {slotsOpen ? <SlotsDialog slots={slots} onClose={() => setSlotsOpen(false)} /> : null}
    </Box>
  );
}
