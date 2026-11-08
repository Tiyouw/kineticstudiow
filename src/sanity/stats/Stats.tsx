"use client";
/**
 * Studio → Statistik: visitors (Cloudflare Web Analytics, once connected), would-be buyers (WhatsApp/email clicks
 * counted by the site) and Threads numbers per account. Data comes from /api/stats, which checks Studio membership
 * with a short-lived request doc written with the editor's own session.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useClient } from "sanity";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Stack, Tab, TabList, Text, useMediaIndex } from "@sanity/ui";
import { RefreshIcon } from "@sanity/icons";

type Row = { label: string; views: number; visits: number };
type Visitors =
  | { connected: false; reason: string }
  | { connected: true; views: number; visits: number; byDay: { day: string; views: number; visits: number }[]; pages: Row[]; countries: Row[]; sources: Row[]; devices: Row[] };
type Account = { username?: string; followers?: number; views: number; likes: number; replies: number; reposts: number; quotes: number; error?: string; topPosts: { url?: string; text: string; views: number; likes: number; at?: string }[] };
type Data = {
  days: number; generatedAt: string; visitors: Visitors;
  clicks: { total: number; byKind: Record<string, number>; byDay: { day: string; count: number }[]; topProducts: { slug: string; name: string; count: number }[] };
  threads: { accounts: Account[] };
};

const KIND_LABEL: Record<string, string> = {
  order: "Order maskot premade", ask: "Tanya soal maskot", custom: "Kirim brief custom", project: "Tanya dari halaman karya", general: "Chat WhatsApp umum", email: "Email",
};
const DEVICE: Record<string, string> = { desktop: "Komputer", mobile: "HP", tablet: "Tablet" };
const n = (x: number) => x.toLocaleString("id-ID");
const shortDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/** A plain SVG bar chart; the bars carry their date and value as a tooltip. */
function Bars({ data, color = "#3b82c4", height = 90 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <Stack space={2}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" width="100%" height={height} role="img" aria-label="Grafik harian">
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          return (
            <rect key={d.label} x={i * w + w * 0.15} width={w * 0.7} y={height - Math.max(h, d.value ? 2 : 0.6)} height={Math.max(h, d.value ? 2 : 0.6)} rx={0.6} fill={d.value ? color : "rgba(127,127,127,.35)"}>
              <title>{`${d.label}: ${n(d.value)}`}</title>
            </rect>
          );
        })}
      </svg>
      {data.length ? (
        <Flex justify="space-between"><Text size={0} muted>{data[0].label}</Text><Text size={0} muted>{data[data.length - 1].label}</Text></Flex>
      ) : null}
    </Stack>
  );
}

/** A ranked list with proportional bars (pages, countries, products…). */
function RankList({ rows, empty = "Belum ada data." }: { rows: { label: string; value: number; href?: string }[]; empty?: string }) {
  if (!rows.length) return <Text size={1} muted>{empty}</Text>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Stack space={3}>
      {rows.map((r) => (
        <Stack key={r.label} space={2}>
          <Flex justify="space-between" gap={2}>
            <Box flex={1} style={{ minWidth: 0 }}>
              <Text size={1} textOverflow="ellipsis">{r.href ? <a href={r.href} target="_blank" rel="noopener">{r.label}</a> : r.label}</Text>
            </Box>
            <Text size={1} weight="semibold">{n(r.value)}</Text>
          </Flex>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(127,127,127,.18)" }}>
            <div style={{ width: `${(r.value / max) * 100}%`, height: "100%", borderRadius: 2, background: "#3b82c4" }} />
          </div>
        </Stack>
      ))}
    </Stack>
  );
}

const Big = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <Card padding={3} radius={2} border>
    <Stack space={2}>
      <Text size={1} muted>{label}</Text>
      <Text size={4} weight="bold">{value}</Text>
      {hint ? <Text size={0} muted>{hint}</Text> : null}
    </Stack>
  </Card>
);

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Stack space={3}>
      <Stack space={2}>
        <Heading as="h2" size={1}>{title}</Heading>
        {sub ? <Text size={1} muted>{sub}</Text> : null}
      </Stack>
      {children}
    </Stack>
  );
}

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card padding={3} radius={2} border><Stack space={3}><Text size={1} weight="semibold">{title}</Text>{children}</Stack></Card>
);

export default function Stats() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const compact = useMediaIndex() < 3;
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (d: number) => {
    setBusy(true);
    setErr(null);
    try {
      const id = `statsRequest-${crypto.randomUUID()}`;
      await client.create({ _id: id, _type: "statsRequest" });
      const r = await fetch(`/api/stats?days=${d}&request=${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`Server menolak (${r.status})`);
      setData(await r.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [client]);

  useEffect(() => { load(days); }, [days, load]);

  const cols = compact ? 1 : 2;
  const v = data?.visitors;

  return (
    <Box padding={compact ? 3 : 4} style={{ overflowY: "auto", height: "100%" }}>
      <Stack space={5} style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Flex align="center" justify="space-between" gap={2} wrap="wrap">
          <Heading as="h1" size={compact ? 2 : 3}>Statistik</Heading>
          <Flex gap={2} align="center">
            <TabList space={1}>
              {([7, 30, 90] as const).map((d) => (
                <Tab key={d} id={`st-${d}`} aria-controls="st-panel" label={`${d} hari`} selected={days === d} onClick={() => setDays(d)} />
              ))}
            </TabList>
            <Button mode="bleed" icon={RefreshIcon} aria-label="Muat ulang" disabled={busy} onClick={() => load(days)} />
          </Flex>
        </Flex>

        {err ? <Card padding={3} radius={2} tone="critical"><Text size={1}>Gagal memuat: {err}</Text></Card> : null}
        {!data ? <Text muted>{busy ? "Memuat…" : ""}</Text> : (
          <div id="st-panel">
            <Stack space={6}>
              {/* ---------- visitors ---------- */}
              <Section title="Pengunjung" sub="Berapa orang membuka situs, halaman apa, dari negara dan sumber mana.">
                {v && v.connected ? (
                  <Stack space={3}>
                    <Grid columns={2} gap={3}>
                      <Big label="Kunjungan" value={n(v.visits)} hint="Satu orang membuka situs = satu kunjungan" />
                      <Big label="Halaman dilihat" value={n(v.views)} />
                    </Grid>
                    <Panel title="Kunjungan per hari"><Bars data={v.byDay.map((d) => ({ label: shortDay(d.day), value: d.visits || d.views }))} /></Panel>
                    <Grid columns={cols} gap={3}>
                      <Panel title="Halaman terpopuler"><RankList rows={v.pages.map((r) => ({ label: r.label, value: r.views }))} /></Panel>
                      <Panel title="Negara"><RankList rows={v.countries.map((r) => ({ label: r.label, value: r.visits || r.views }))} /></Panel>
                      <Panel title="Datang dari"><RankList rows={v.sources.map((r) => ({ label: r.label, value: r.visits || r.views }))} /></Panel>
                      <Panel title="Perangkat"><RankList rows={v.devices.map((r) => ({ label: DEVICE[r.label] ?? r.label, value: r.visits || r.views }))} /></Panel>
                    </Grid>
                  </Stack>
                ) : (
                  <Card padding={4} radius={2} tone="caution" border>
                    <Stack space={2}>
                      <Text size={1} weight="semibold">Data pengunjung belum disambungkan</Text>
                      <Text size={1} muted>Tiyo sedang menyambungkan pencatat pengunjung (Cloudflare Web Analytics, tanpa cookie). Setelah itu angkanya muncul di sini.</Text>
                    </Stack>
                  </Card>
                )}
              </Section>

              {/* ---------- would-be buyers ---------- */}
              <Section title="Calon pembeli" sub="Berapa kali pengunjung menekan tombol WhatsApp atau email. Dihitung sejak fitur ini aktif.">
                <Grid columns={2} gap={3}>
                  <Big label="Klik WhatsApp + email" value={n(data.clicks.total)} />
                  <Big label="Order maskot premade" value={n(data.clicks.byKind.order ?? 0)} hint={`Brief custom: ${n(data.clicks.byKind.custom ?? 0)}`} />
                </Grid>
                <Panel title="Klik per hari"><Bars data={data.clicks.byDay.map((d) => ({ label: shortDay(d.day), value: d.count }))} color="#3aa76d" /></Panel>
                <Grid columns={cols} gap={3}>
                  <Panel title="Tombol yang ditekan">
                    <RankList rows={Object.entries(data.clicks.byKind).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).map(([k, c]) => ({ label: KIND_LABEL[k] ?? k, value: c }))} empty="Belum ada klik di periode ini." />
                  </Panel>
                  <Panel title="Maskot paling diminati">
                    <RankList rows={data.clicks.topProducts.map((p) => ({ label: p.name, value: p.count, href: `/en/shop/${p.slug}` }))} empty="Belum ada klik order/tanya maskot." />
                  </Panel>
                </Grid>
              </Section>

              {/* ---------- Threads ---------- */}
              <Section title="Threads" sub="Angka dari Threads untuk tiap akun yang tersambung.">
                {data.threads.accounts.length ? data.threads.accounts.map((a) => (
                  <Card key={a.username} padding={3} radius={2} border>
                    <Stack space={4}>
                      <Flex align="center" gap={2}>
                        <Text weight="semibold">@{a.username}</Text>
                        {a.followers !== undefined ? <Badge fontSize={0}>{n(a.followers)} pengikut</Badge> : null}
                      </Flex>
                      {a.error ? <Text size={1} muted>Belum bisa dibaca: {a.error}</Text> : (
                        <>
                          <Grid columns={compact ? 2 : 5} gap={2}>
                            {([["views", "Dilihat"], ["likes", "Suka"], ["replies", "Balasan"], ["reposts", "Repost"], ["quotes", "Kutipan"]] as const).map(([k, l]) => (
                              <Card key={k} padding={2} radius={2} tone="transparent"><Stack space={2}><Text size={0} muted>{l}</Text><Text size={2} weight="bold">{n(a[k])}</Text></Stack></Card>
                            ))}
                          </Grid>
                          <Stack space={2}>
                            <Text size={1} weight="semibold">Post terbaik</Text>
                            <RankList rows={a.topPosts.map((p) => ({ label: p.text || "(foto)", value: p.views, href: p.url }))} empty="Belum ada post di periode ini." />
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Card>
                )) : <Text size={1} muted>Belum ada akun Threads tersambung (menu Konten → Threads).</Text>}
              </Section>

              <Card padding={4} radius={2} tone="transparent" border>
                <Stack space={2}>
                  <Text size={1} weight="semibold">Google Search: segera</Text>
                  <Text size={1} muted>Kata kunci yang dipakai orang sampai menemukan situs ini, dan posisinya di Google.</Text>
                </Stack>
              </Card>

              <Text size={0} muted>Diperbarui {new Date(data.generatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}. Angka disimpan sementara 5 menit.</Text>
            </Stack>
          </div>
        )}
      </Stack>
    </Box>
  );
}
