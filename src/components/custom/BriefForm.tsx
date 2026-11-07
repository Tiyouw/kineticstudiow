"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useWa } from "@/components/WaProvider";
import type { CustomDict, Option } from "@/i18n/pages/custom";
import Bubble from "@/components/Bubble";
import { CheckIcon, MailIcon, WaIcon } from "@/components/Icons";

type BubbleLabels = { head: string; to: string; meta: string };

type State = {
  name: string;
  brand: string;
  business: string;
  deadline: string;
  services: string[];
  style: string[];
  usage: string[];
  budget: string;
  notes: string;
};

const EMPTY: State = { name: "", brand: "", business: "", deadline: "", services: [], style: [], usage: [], budget: "", notes: "" };

const label = (opts: Option[], key: string) => opts.find((o) => o.key === key)?.label ?? "";
const labels = (opts: Option[], keys: string[]) => opts.filter((o) => keys.includes(o.key)).map((o) => o.label).join(", ");
const dmy = (v: string) => {
  const p = v.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v;
};

function Chips({ group, opts, value, multi, onChange }: {
  group: string; opts: Option[]; value: string[]; multi: boolean; onChange: (v: string[]) => void;
}) {
  return (
    <div className="chips" data-group={group}>
      {opts.map((o) => {
        const on = value.includes(o.key);
        const next = multi ? (on ? value.filter((k) => k !== o.key) : [...value, o.key]) : on ? [] : [o.key];
        return (
          <button key={o.key} type="button" className="chip" aria-pressed={on} onClick={() => onChange(next)}>
            <CheckIcon />{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** The brief form and its live WhatsApp preview (two grid children of #brief .wrap). */
export default function BriefForm({ locale, t, bubble }: { locale: Locale; t: CustomDict; bubble: BubbleLabels }) {
  const wa_ = useWa();
  const [s, setS] = useState<State>(EMPTY);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((prev) => ({ ...prev, [k]: v }));
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTyping(false), 650);
  };

  const fields = {
    name: s.name.trim(),
    brand: s.brand.trim(),
    business: label(t.business, s.business),
    services: labels(t.services, s.services),
    style: labels(t.styles, s.style),
    usage: labels(t.usage, s.usage),
    budget: label(t.budgets, s.budget),
    deadline: s.deadline ? dmy(s.deadline) : "",
    notes: s.notes.trim(),
  };
  const f = t.form;

  return (
    <>
      <form id="brief-form" aria-label={f.aria} onSubmit={(e) => e.preventDefault()}>
        <h2 className="disp rough full">{f.title}</h2>
        <div className="field">
          <label htmlFor="f-name">{f.name}</label>
          <input id="f-name" name="name" autoComplete="name" placeholder={f.namePh} value={s.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-brand">{f.brand}</label>
          <input id="f-brand" name="brand" autoComplete="organization" placeholder={f.brandPh} value={s.brand} onChange={(e) => set("brand", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-business">{f.business}</label>
          <select id="f-business" name="business" value={s.business} onChange={(e) => set("business", e.target.value)}>
            <option value="">{f.businessPh}</option>
            {t.business.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-deadline">{f.deadline}</label>
          <input id="f-deadline" name="deadline" type="date" value={s.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
        <fieldset className="field full">
          <legend>{f.services} <small>{f.pickAny}</small></legend>
          <Chips group="services" opts={t.services} value={s.services} multi onChange={(v) => set("services", v)} />
        </fieldset>
        <fieldset className="field full">
          <legend>{f.style} <small>{f.pickOne}</small></legend>
          <Chips group="style" opts={t.styles} value={s.style} multi={false} onChange={(v) => set("style", v)} />
        </fieldset>
        <fieldset className="field full">
          <legend>{f.usage} <small>{f.pickAny}</small></legend>
          <Chips group="usage" opts={t.usage} value={s.usage} multi onChange={(v) => set("usage", v)} />
        </fieldset>
        <div className="field full">
          <label htmlFor="f-budget">{f.budget} <small>{f.budgetNote}</small></label>
          <select id="f-budget" name="budget" value={s.budget} onChange={(e) => set("budget", e.target.value)}>
            <option value="">{f.budgetPh}</option>
            {t.budgets.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="f-notes">{f.notes}</label>
          <textarea id="f-notes" name="notes" placeholder={f.notesPh} value={s.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </form>
      <aside id="preview" aria-label={t.preview.aria}>
        <p className="eyebrow">{t.preview.eyebrow}</p>
        <h2 className="disp rough">{t.preview.title}</h2>
        <Bubble live typing={typing} text={wa_.text("custom", locale, fields)} head={bubble.head} to={bubble.to} meta={bubble.meta} />
        <a id="send" className="btn btn-red" href={wa_.href("custom", locale, fields)} target="_blank" rel="noopener"><WaIcon /> {t.preview.send}</a>
        {locale === "en" ? <a id="send-mail" className="mail-alt" href={wa_.mail("custom", locale, fields)}><MailIcon /> {t.preview.mail}</a> : null}
        <p id="preview-note">{t.preview.note}</p>
      </aside>
    </>
  );
}
