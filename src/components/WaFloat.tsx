import type { Locale } from "@/lib/i18n";
import { getWaLinks } from "@/content";
import { WaIcon } from "./Icons";

export default async function WaFloat({ locale, label, delay = "1s" }: { locale: Locale; label: string; delay?: string }) {
  const w = await getWaLinks();
  return (
    <a id="wa-float" href={w.href("general", locale)} target="_blank" rel="noopener" aria-label={label} style={{ ["--wd" as string]: delay }}>
      <WaIcon />
    </a>
  );
}
