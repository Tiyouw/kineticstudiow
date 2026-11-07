"use client";
/**
 * "Pratinjau" view inside a document in Konten: the page this document shows on, with unpublished changes,
 * reloading a moment after each edit. Open it next to the form with ⋯ → "Split pane right".
 */
import { useEffect, useRef, useState } from "react";
import { useClient, type SanityDocument } from "sanity";
import { createPreviewSecret } from "@sanity/preview-url-secret/create-secret";
import { Box, Button, Card, Flex, Text } from "@sanity/ui";

type Props = { document: { displayed: Partial<SanityDocument> & Record<string, unknown> }; schemaType: { name: string } };

const COPY: Record<string, string> = { common: "", home: "", work: "/work", shop: "/shop", product: "/shop", custom: "/custom-order", about: "/about", faq: "/faq", notfound: "/halaman-tidak-ada" };

/** The page (after /en or /id) a document shows on. */
function pathOf(type: string, doc: Record<string, unknown>): string {
  const slug = (doc.slug as { current?: string } | undefined)?.current;
  if (type === "product") return slug ? `/shop/${slug}` : "/shop";
  if (type === "project") return slug ? `/work/${slug}` : "/work";
  if (type === "settings") return "/custom-order";
  if (type.startsWith("copy_")) return COPY[type.slice(5)] ?? "";
  return ""; // testimonials, client logos: Home
}

export default function PreviewPane({ document, schemaType }: Props) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const doc = document.displayed;
  const [lang, setLang] = useState<"en" | "id">("en");
  const [ready, setReady] = useState(false); // draft mode is on for this browser
  const [src, setSrc] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const path = `/${lang}${pathOf(schemaType.name, doc)}`;

  // turn draft mode on once, through the same secret handshake Pratinjau uses
  useEffect(() => {
    let gone = false;
    createPreviewSecret(client, "kinetic-preview-pane", window.location.href)
      .then(({ secret }) => {
        if (gone) return;
        setSrc(`/api/draft-mode/enable?sanity-preview-secret=${secret}&sanity-preview-pathname=${encodeURIComponent(path)}`);
        setReady(true);
      })
      .catch(() => !gone && setSrc(path));
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // after that: follow the language and reload shortly after each edit
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setSrc(`${path}?r=${encodeURIComponent(String(doc._rev ?? Date.now()))}`), 900);
    return () => window.clearTimeout(t);
  }, [ready, path, doc._rev]);

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      <Card padding={2} borderBottom>
        <Flex align="center" gap={2}>
          <Button mode={lang === "en" ? "default" : "ghost"} text="EN" onClick={() => setLang("en")} />
          <Button mode={lang === "id" ? "default" : "ghost"} text="ID" onClick={() => setLang("id")} />
          <Box flex={1} paddingX={2}><Text size={1} muted textOverflow="ellipsis">{path} · belum di-Publish ikut tampil</Text></Box>
          <Button mode="ghost" text="Muat ulang" onClick={() => frame.current?.contentWindow?.location.reload()} />
          <Button as="a" mode="ghost" text="Buka tab baru" href={path} target="_blank" rel="noopener" />
        </Flex>
      </Card>
      <Box flex={1} style={{ minHeight: 0 }}>
        {src ? <iframe ref={frame} key={src} src={src} title="Pratinjau" style={{ border: 0, width: "100%", height: "100%", display: "block" }} /> : null}
      </Box>
    </Flex>
  );
}
