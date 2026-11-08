"use client";
/**
 * "Bagikan" on a Journal post: one click opens X, Threads, LinkedIn, Facebook, WhatsApp or Pinterest with the
 * caption and link filled in; captions trimmed per platform to copy; the cover to download for Instagram.
 * It stores nothing: it reads the post's current values.
 */
import { useState } from "react";
import { useEditState, useFormValue } from "sanity";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { SITE_URL } from "@/lib/site";
import { dataset, projectId } from "./env";
import { DEFAULT_TAGS, THREADS_LIMIT, X_LIMIT, igText, imageUrl, TIKTOK_UPLOAD, tiktokText, shareLinks, threadsText, xCount, xText } from "./share";

function CopyRow({ label, text, count, limit }: { label: string; text: string; count: number; limit?: number }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard blocked: the text is visible to select by hand */
    }
  };
  const over = limit !== undefined && count > limit;
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Flex align="center" gap={2}>
          <Box flex={1}><Text size={1} weight="semibold">{label}</Text></Box>
          <Text size={1} muted style={over ? { color: "var(--card-badge-critical-dot-color, #e5484d)" } : undefined}>
            {count}{limit ? ` / ${limit}` : ""} karakter
          </Text>
          <Button fontSize={1} padding={2} mode={done ? "default" : "ghost"} tone={done ? "positive" : "default"} text={done ? "Tersalin ✓" : "Copy"} onClick={copy} />
        </Flex>
        <Text size={1} muted style={{ whiteSpace: "pre-wrap" }}>{text}</Text>
      </Stack>
    </Card>
  );
}

export default function SharePanel() {
  const id = String(useFormValue(["_id"]) ?? "").replace(/^drafts\./, "");
  const titleEn = (useFormValue(["title", "en"]) as string | undefined) ?? "";
  const slug = (useFormValue(["slug", "current"]) as string | undefined) ?? "";
  const caption = ((useFormValue(["caption"]) as string | undefined) ?? "").trim() || titleEn;
  const coverRef = useFormValue(["cover", "asset", "_ref"]) as string | undefined;
  const edit = useEditState(id, "post");
  const [tags, setTags] = useState(DEFAULT_TAGS);

  if (!slug) {
    return <Card padding={3} radius={2} tone="caution" border><Text size={1}>Isi judul dan klik Generate di Alamat halaman dulu, baru tombol bagikan muncul.</Text></Card>;
  }

  const url = `${SITE_URL}/en/journal/${slug}`;
  const image = imageUrl(coverRef, projectId, dataset, 1440);
  const download = imageUrl(coverRef, projectId, dataset, 1440, `kinetic-${slug}.jpg`);
  const links = shareLinks(caption, url, image);
  const x = xText(caption);
  const th = threadsText(caption, url);
  const ig = igText(caption, tags);
  const tt = tiktokText(caption, tags);
  const published = !!edit.published;
  const changed = published && !!edit.draft;

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} tone={published ? (changed ? "caution" : "positive") : "caution"} border>
        <Stack space={2}>
          <Text size={1} weight="semibold">
            {!published ? "Publish dulu, baru bagikan: tulisan ini belum terbit, jadi link-nya belum bisa dibuka orang." : changed ? "Ada perubahan yang belum di-Publish. Publish dulu supaya yang dibagikan versi terbaru." : "Sudah terbit, siap dibagikan."}
          </Text>
          <Text size={1} muted><a href={url} target="_blank" rel="noopener">{url}</a></Text>
        </Stack>
      </Card>

      <Stack space={2}>
        <Text size={1} weight="semibold">Buka dengan teks sudah terisi</Text>
        <Text size={1} muted>Foto tidak ikut otomatis: tambahkan sendiri di kotak posting (unduh sampul di bawah).</Text>
        <Flex gap={2} wrap="wrap">
          <Button as="a" href={links.x} target="_blank" rel="noopener" mode="ghost" text="Post ke X" />
          <Button as="a" href={links.threads} target="_blank" rel="noopener" mode="ghost" text="Post ke Threads" />
          <Button as="a" href={links.linkedin} target="_blank" rel="noopener" mode="ghost" text="LinkedIn" />
          <Button as="a" href={links.facebook} target="_blank" rel="noopener" mode="ghost" text="Facebook" />
          <Button as="a" href={links.whatsapp} target="_blank" rel="noopener" mode="ghost" text="WhatsApp" />
          <Button as="a" href={links.pinterest} target="_blank" rel="noopener" mode="ghost" text="Pinterest" />
        </Flex>
      </Stack>

      <Stack space={2}>
        <Text size={1} weight="semibold">Caption siap tempel</Text>
        <CopyRow label="X (link ikut di belakang)" text={`${x} ${url}`} count={xCount(x)} limit={X_LIMIT} />
        <CopyRow label="Threads" text={th} count={th.length} limit={THREADS_LIMIT} />
        <CopyRow label="Instagram" text={ig} count={ig.length} limit={2200} />
        <CopyRow label="TikTok (mode foto: unduh sampul di bawah, lalu upload)" text={tt} count={tt.length} limit={2200} />
        <Flex><Button as="a" href={TIKTOK_UPLOAD} target="_blank" rel="noopener" mode="ghost" fontSize={1} text="Buka upload TikTok" /></Flex>
        <Stack space={2}>
          <Text size={1} muted>Hashtag untuk Instagram dan TikTok (boleh diubah, tidak disimpan):</Text>
          <TextInput fontSize={1} value={tags} onChange={(e) => setTags(e.currentTarget.value)} />
        </Stack>
      </Stack>

      {download ? (
        <Flex gap={2} align="center">
          <Button as="a" href={download} mode="ghost" text="Unduh foto sampul" />
          <Text size={1} muted>JPG 1440 px, untuk Instagram atau platform lain.</Text>
        </Flex>
      ) : (
        <Text size={1} muted>Pilih Foto sampul supaya bisa diunduh di sini.</Text>
      )}
    </Stack>
  );
}
