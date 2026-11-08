"use client";
/** Agenda building blocks: a post card with its action menu, and the dialogs (quick add, date, slots). */
import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { useClient } from "sanity";
import { Badge, Box, Button, Card, Checkbox, Dialog, Flex, Menu, MenuButton, MenuDivider, MenuItem, Radio, Select, Stack, Text, TextArea, TextInput } from "@sanity/ui";
import { AddIcon, CalendarIcon, EllipsisHorizontalIcon, TrashIcon } from "@sanity/icons";
import { dataset, projectId } from "../env";
import { imageUrl } from "../share";
import { DAY_NAMES, STAGE, fmtFull, type NewPost, fromLocalInput, nextFreeSlot, slotsOn, takenAt, toLocalInput, type Item, type Slot, type Stage } from "./model";

/* ---------- small pieces ---------- */

export const Dot = ({ stage, size = 10 }: { stage: Stage; size?: number }) => (
  <span aria-hidden style={{ width: size, height: size, borderRadius: 99, background: STAGE[stage].color, display: "inline-block", flex: "none" }} />
);

export type Act = "open" | "idea" | "draft" | "ready" | "schedule" | "queue" | "now" | "date";

/** One post: thumbnail, title, date, badges, and a ⋯ menu with every move (the touch-friendly way to use the board). */
export function ItemCard({ it, onAct, draggable, compact, hasSlots }: { it: Item; onAct: (a: Act, it: Item) => void; draggable?: boolean; compact?: boolean; hasSlots: boolean }) {
  const thumb = imageUrl(it.cover, projectId, dataset, 160);
  const unpublished = !it.hasPublished;
  return (
    <Card
      padding={2}
      radius={2}
      shadow={1}
      draggable={draggable}
      onDragStart={draggable ? (e: DragEvent) => { e.dataTransfer.setData("text/plain", it.id); e.dataTransfer.effectAllowed = "move"; } : undefined}
      style={{ borderLeft: `3px solid ${STAGE[it.stage].color}`, cursor: draggable ? "grab" : undefined }}
    >
      <Flex gap={2} align="center">
        <Box flex={1} style={{ minWidth: 0, cursor: "pointer" }} onClick={() => onAct("open", it)}>
          <Flex gap={2} align="center">
            {!compact ? (thumb
              ? <img src={thumb} alt="" width={44} height={44} style={{ objectFit: "cover", borderRadius: 4, flex: "none" }} />
              : <Box style={{ width: 44, height: 44, borderRadius: 4, background: "rgba(127,127,127,.15)", flex: "none" }} />) : null}
            <Stack space={2} flex={1} style={{ minWidth: 0 }}>
              <Text size={1} weight="semibold" textOverflow="ellipsis">{it.title}</Text>
              <Text size={0} muted textOverflow="ellipsis">
                {it.stage === "idea" ? (it.notes || "Ide") : it.date ? fmtFull(it.date) : "Belum diberi tanggal"}
              </Text>
              {it.changed || it.threads || it.short ? (
                <Flex gap={1} wrap="wrap">
                  {it.promo ? <Badge tone="primary" fontSize={0}>Promo</Badge> : it.short ? <Badge fontSize={0}>Threads saja</Badge> : null}
                  {it.promoSold ? <Badge tone="critical" fontSize={0}>Maskot terjual, tidak dikirim</Badge> : null}
                  {it.changed ? <Badge tone="caution" fontSize={0}>Perubahan belum di-Publish</Badge> : null}
                  {it.threads ? <Badge tone={it.shared >= it.threads ? "positive" : "primary"} fontSize={0}>Threads {it.shared}/{it.threads}</Badge> : null}
                </Flex>
              ) : null}
            </Stack>
          </Flex>
        </Box>
        <MenuButton
          id={`m-${it.id}`}
          button={<Button mode="bleed" icon={EllipsisHorizontalIcon} padding={3} aria-label="Pilihan" />}
          popover={{ portal: true, placement: "bottom-end" }}
          menu={
            <Menu>
              <MenuItem text="Buka" onClick={() => onAct("open", it)} />
              <MenuDivider />
              {unpublished ? (
                <>
                  {it.stage !== "idea" ? <MenuItem text="Pindah ke Ide" onClick={() => onAct("idea", it)} /> : null}
                  {it.stage !== "draft" ? <MenuItem text="Pindah ke Draf" onClick={() => onAct("draft", it)} /> : null}
                  {it.stage !== "ready" ? <MenuItem text="Tandai Siap" onClick={() => onAct("ready", it)} /> : null}
                  <MenuDivider />
                  <MenuItem icon={CalendarIcon} text="Jadwalkan…" onClick={() => onAct("schedule", it)} />
                  {hasSlots ? <MenuItem text="Antrikan ke slot kosong berikutnya" onClick={() => onAct("queue", it)} /> : null}
                  <MenuItem text="Terbitkan sekarang" onClick={() => onAct("now", it)} />
                  <MenuItem text={it.date ? "Ubah tanggal (tanpa Publish)…" : "Beri tanggal (tanpa Publish)…"} onClick={() => onAct("date", it)} />
                </>
              ) : (
                <>
                  <MenuItem icon={CalendarIcon} text="Ubah jadwal…" onClick={() => onAct("date", it)} />
                  {hasSlots && it.stage === "scheduled" ? <MenuItem text="Pindah ke slot kosong berikutnya" onClick={() => onAct("queue", it)} /> : null}
                  {it.stage === "scheduled" ? <MenuItem text="Terbitkan sekarang" onClick={() => onAct("now", it)} /> : null}
                </>
              )}
            </Menu>
          }
        />
      </Flex>
    </Card>
  );
}

/** A dashed placeholder for an empty slot; tap to write for it. */
export const SlotGhost = ({ at, onAdd, label }: { at: Date; onAdd: (at: Date) => void; label?: string }) => (
  <Card padding={2} radius={2} border style={{ borderStyle: "dashed", cursor: "pointer", background: "transparent" }} onClick={() => onAdd(at)}>
    <Flex align="center" gap={2}>
      <AddIcon />
      <Text size={1} muted>{label ?? `Slot kosong · ${fmtFull(at)}`}</Text>
    </Flex>
  </Card>
);

/* ---------- date helpers in dialogs ---------- */

/** The next few free slots as one-tap chips. */
function SlotChips({ slots, items, ignoreId, onPick }: { slots: Slot[]; items: Item[]; ignoreId?: string; onPick: (d: Date) => void }) {
  const chips = useMemo(() => {
    const taken = takenAt(items.filter((i) => i.id !== ignoreId));
    const out: Date[] = [];
    const soon = Date.now() + 15 * 60_000;
    const d = new Date();
    for (let i = 0; i < 60 && out.length < 4; i++) {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      for (const t of slotsOn(day, slots)) if (t.getTime() >= soon && !taken.has(t.getTime()) && out.length < 4) out.push(t);
    }
    return out;
  }, [slots, items, ignoreId]);
  if (!chips.length) return null;
  return (
    <Stack space={2}>
      <Text size={1} muted>Slot kosong berikutnya:</Text>
      <Flex gap={2} wrap="wrap">{chips.map((c) => <Button key={c.getTime()} mode="ghost" fontSize={1} padding={2} text={fmtFull(c)} onClick={() => onPick(c)} />)}</Flex>
    </Stack>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <Stack space={2}>
      <Text size={1} weight="semibold">{label}</Text>
      {children}
      {hint ? <Text size={0} muted>{hint}</Text> : null}
    </Stack>
  );
}

/* ---------- quick add ---------- */

type Account = { id: string; username?: string };

export function QuickAdd({ at, slots, items, onClose, onSave }: {
  at?: Date; slots: Slot[]; items: Item[]; onClose: () => void;
  onSave: (f: NewPost, open: boolean) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"article" | "short">("article");
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState<"idea" | "draft" | "ready">(at ? "draft" : "idea");
  const [when, setWhen] = useState(at ? toLocalInput(at) : "");
  const [notes, setNotes] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/threads/status", { cache: "no-store" }).then((r) => r.json()).then((s: { accounts?: Account[] }) => setAccounts(s.accounts ?? [])).catch(() => {});
  }, []);

  const save = async (open: boolean) => {
    if (!title.trim()) return;
    setBusy(true);
    try { await onSave({ title, kind, stage, at: stage === "idea" ? undefined : fromLocalInput(when), notes, caption: kind === "short" ? caption : undefined, accounts: picked }, open); } finally { setBusy(false); }
  };

  return (
    <Dialog id="agenda-add" header="Tambah tulisan" onClose={onClose} width={1} zOffset={1000}
      footer={
        <Flex gap={2} padding={3} justify="flex-end" wrap="wrap">
          <Button mode="ghost" text="Simpan" disabled={!title.trim() || busy} onClick={() => save(false)} />
          <Button tone="primary" text="Simpan & tulis" disabled={!title.trim() || busy} onClick={() => save(true)} />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          <Field label="Jenis">
            <Flex gap={4} wrap="wrap">
              {([["article", "Tulisan Journal"], ["short", "Post Threads saja"]] as const).map(([k, l]) => (
                <Flex key={k} as="label" align="center" gap={2} style={{ cursor: "pointer" }}>
                  <Radio checked={kind === k} onChange={() => setKind(k)} name="agenda-kind" />
                  <Text size={1}>{l}</Text>
                </Flex>
              ))}
            </Flex>
          </Field>
          <Field label={kind === "short" ? "Nama (hanya di Agenda)" : "Judul (English)"} hint="Bisa diubah nanti.">
            <TextInput autoFocus value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Misalnya: Behind the mascot: Kopi Kakek" />
          </Field>
          <Field label="Tahap">
            <Flex gap={4} wrap="wrap">
              {(["idea", "draft", "ready"] as const).map((s) => (
                <Flex key={s} as="label" align="center" gap={2} style={{ cursor: "pointer" }}>
                  <Radio checked={stage === s} onChange={() => setStage(s)} name="agenda-stage" />
                  <Text size={1}>{STAGE[s].label}</Text>
                </Flex>
              ))}
            </Flex>
          </Field>
          {kind === "short" && stage !== "idea" ? (
            <Field label="Caption" hint={`${caption.length}/500. Foto dan link bisa ditambahkan di form.`}>
              <TextArea rows={4} value={caption} maxLength={500} onChange={(e) => setCaption(e.currentTarget.value)} />
            </Field>
          ) : null}
          {stage === "idea" ? (
            <Field label="Catatan" hint="Tidak tampil di situs.">
              <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.currentTarget.value)} placeholder="Poin-poin, referensi, foto yang mau dipakai…" />
            </Field>
          ) : (
            <Field label="Rencana terbit" hint="Belum di-Publish: kamu tetap menulis dulu, lalu Jadwalkan dari menu ⋯ atau Publish di form.">
              <TextInput type="datetime-local" value={when} onChange={(e) => setWhen(e.currentTarget.value)} />
              <SlotChips slots={slots} items={items} onPick={(d) => setWhen(toLocalInput(d))} />
            </Field>
          )}
          {accounts.length ? (
            <Field label="Kirim ke Threads (opsional)">
              <Stack space={2}>
                {accounts.map((a) => (
                  <Flex key={a.id} as="label" align="center" gap={2} style={{ cursor: "pointer" }}>
                    <Checkbox checked={picked.includes(a.id)} onChange={(e) => { const on = e.currentTarget.checked; setPicked((p) => (on ? [...p, a.id] : p.filter((x) => x !== a.id))); }} />
                    <Text size={1}>@{a.username ?? a.id}</Text>
                  </Flex>
                ))}
              </Stack>
            </Field>
          ) : null}
        </Stack>
      </Box>
    </Dialog>
  );
}

/* ---------- pick a date (schedule / change date) ---------- */

export function DateDialog({ it, mode, slots, items, onClose, onConfirm }: {
  it: Item; mode: "schedule" | "date"; slots: Slot[]; items: Item[]; onClose: () => void; onConfirm: (d: Date) => Promise<void>;
}) {
  const start = it.date && it.date.getTime() > Date.now() ? it.date : nextFreeSlot(slots, items, it.id) ?? it.date ?? new Date(Date.now() + 60 * 60_000);
  const [when, setWhen] = useState(toLocalInput(start));
  const [busy, setBusy] = useState(false);
  const d = fromLocalInput(when);
  const past = !!d && d.getTime() <= Date.now();
  const publishing = mode === "schedule";
  return (
    <Dialog id="agenda-date" header={publishing ? "Jadwalkan" : it.hasPublished ? "Ubah jadwal" : "Beri tanggal"} onClose={onClose} width={1} zOffset={1000}
      footer={
        <Flex gap={2} padding={3} justify="flex-end">
          <Button mode="ghost" text="Batal" onClick={onClose} />
          <Button tone="primary" disabled={!d || busy} text={busy ? "Menyimpan…" : publishing ? (past ? "Terbitkan sekarang" : "Jadwalkan") : "Simpan"}
            onClick={async () => { if (!d) return; setBusy(true); try { await onConfirm(d); } finally { setBusy(false); } }} />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text size={1} weight="semibold">{it.title}</Text>
          <TextInput type="datetime-local" value={when} onChange={(e) => setWhen(e.currentTarget.value)} />
          <SlotChips slots={slots} items={items} ignoreId={it.id} onPick={(x) => setWhen(toLocalInput(x))} />
          <Text size={1} muted>
            {publishing
              ? past ? "Waktunya sudah lewat: tulisan langsung tampil di situs." : "Tulisan di-Publish sekarang, tapi baru tampil di situs (dan terkirim ke Threads) pada waktu ini, paling lambat sekitar 15 menit setelahnya."
              : it.hasPublished
                ? past ? "Tulisan tampil di situs dengan tanggal ini." : "Tulisan tersembunyi dari situs sampai waktu ini."
                : "Hanya rencana tanggal. Tulisan belum di-Publish."}
          </Text>
        </Stack>
      </Box>
    </Dialog>
  );
}

/* ---------- fixed slots ---------- */

export function SlotsDialog({ slots, onClose }: { slots: Slot[]; onClose: () => void }) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [list, setList] = useState<Slot[]>(slots.length ? slots : [{ day: 2, time: "09:00" }, { day: 5, time: "09:00" }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const clean = list.filter((s) => /^\d{2}:\d{2}$/.test(s.time)).map((s, i) => ({ _key: s._key ?? `s${i}${Date.now()}`, _type: "slot", day: Number(s.day), time: s.time }));
      await client.createIfNotExists({ _id: "agendaSettings", _type: "agendaSettings" });
      await client.patch("agendaSettings").set({ slots: clean }).commit();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog id="agenda-slots" header="Slot posting tetap" onClose={onClose} width={1} zOffset={1000}
      footer={<Flex gap={2} padding={3} justify="flex-end"><Button mode="ghost" text="Batal" onClick={onClose} /><Button tone="primary" text={busy ? "Menyimpan…" : "Simpan"} disabled={busy} onClick={save} /></Flex>}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text size={1} muted>Jadwal rutin, misalnya tiap Selasa dan Jumat jam 09.00. Slot yang belum terisi tampil di Agenda, dan Antrikan mengisi slot kosong berikutnya.</Text>
          {list.map((s, i) => (
            <Flex key={i} gap={2} align="center">
              <Box flex={2}>
                <Select value={s.day} onChange={(e) => { const v = Number(e.currentTarget.value); setList((l) => l.map((x, j) => (j === i ? { ...x, day: v } : x))); }}>
                  {DAY_NAMES.map((n, d) => <option key={d} value={d}>{n}</option>)}
                </Select>
              </Box>
              <Box flex={1}>
                <TextInput type="time" value={s.time} onChange={(e) => { const v = e.currentTarget.value; setList((l) => l.map((x, j) => (j === i ? { ...x, time: v } : x))); }} />
              </Box>
              <Button mode="bleed" tone="critical" icon={TrashIcon} aria-label="Hapus slot" onClick={() => setList((l) => l.filter((_, j) => j !== i))} />
            </Flex>
          ))}
          <Box><Button mode="ghost" icon={AddIcon} text="Tambah slot" onClick={() => setList((l) => [...l, { day: 1, time: "09:00" }])} /></Box>
          {err ? <Card padding={3} tone="critical" radius={2}><Text size={1}>{err}</Text></Card> : null}
        </Stack>
      </Box>
    </Dialog>
  );
}
