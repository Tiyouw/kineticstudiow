import type { Locale } from "@/lib/i18n";
import { waHref } from "@/lib/whatsapp";
import { WaIcon } from "./Icons";

export default function WaFloat({ locale, label, delay = "1s" }: { locale: Locale; label: string; delay?: string }) {
  return (
    <a id="wa-float" href={waHref("general", locale)} target="_blank" rel="noopener" aria-label={label} style={{ ["--wd" as string]: delay }}>
      <WaIcon />
    </a>
  );
}
