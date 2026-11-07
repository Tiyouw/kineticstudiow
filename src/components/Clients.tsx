import type { ClientMark } from "@/content";
import type { CommonDict } from "@/i18n/common";

function Mark({ m, hidden }: { m: ClientMark; hidden?: boolean }) {
  if (m.logo) return <span className="mk mk-logo" aria-hidden={hidden || undefined}><img src={m.logo} alt={hidden ? "" : m.name} /></span>;
  const inner = m.variant === 6 ? (<>{m.name.split(" ")[0]}<b>{m.name.split(" ").slice(1).join(" ")}</b></>) : m.name;
  return <span className={`mk mk-${m.variant}`} aria-hidden={hidden || undefined}>{inner}</span>;
}

export default function Clients({ marks, c, id = "clients" }: { marks: ClientMark[]; c: CommonDict; id?: string }) {
  return (
    <section id={id} className="band on-ink">
      <div className="band-ht" />
      <div id="clients-inner">
        <div id="clients-head"><h2 className="label">{c.clients.title}</h2><span>{c.clients.note}</span></div>
        <div id="clients-strip" aria-label={c.clients.aria}>
          <div id="clients-track">
            {marks.map((m) => <Mark key={m.name} m={m} />)}
            {marks.map((m) => <Mark key={m.name + "-dup"} m={m} hidden />)}
          </div>
        </div>
      </div>
    </section>
  );
}
