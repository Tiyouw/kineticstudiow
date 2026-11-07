"use client";
import { useEffect, useRef, useState } from "react";
import { QUESTIONS, SECTIONS, SKIP, isAnswered, type Answer, type Question } from "@/lib/fatwaQuestions";

type Status = "idle" | "saving" | "saved" | "error";

export default function Questionnaire({ token, initial }: { token: string; initial: Record<string, Answer> }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>(initial);
  // -1: welcome, 0..n-1: sections, n: done
  const [step, setStep] = useState(-1);
  const [status, setStatus] = useState<Status>("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const latest = useRef(answers);
  latest.current = answers;
  const inflight = useRef(0);

  const send = async (key: string) => {
    inflight.current++;
    setStatus("saving");
    try {
      const res = await fetch("/api/q", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, key, answer: latest.current[key] ?? {} }),
      });
      if (!res.ok) throw new Error(String(res.status));
      inflight.current--;
      if (inflight.current === 0) setStatus("saved");
    } catch {
      inflight.current--;
      setStatus("error");
    }
  };

  const update = (key: string, a: Answer, delay = 0) => {
    setAnswers((prev) => ({ ...prev, [key]: a }));
    latest.current = { ...latest.current, [key]: a };
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => { delete timers.current[key]; send(key); }, delay);
  };

  const flush = () => {
    for (const [key, t] of Object.entries(timers.current)) { clearTimeout(t); delete timers.current[key]; send(key); }
  };

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  });

  const go = (s: number) => { flush(); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const done = QUESTIONS.filter((q) => isAnswered(answers[q.key])).length;
  const pct = Math.round((done / QUESTIONS.length) * 100);

  return (
    <main className="qz-wrap">
      <header className="qz-top">
        <div className="qz-brand">Kinetic Studiow</div>
        <div className={`qz-status ${status}`} aria-live="polite">
          {status === "saving" ? "Menyimpan…" : status === "saved" ? "Tersimpan ✓" : status === "error" ? "Gagal simpan, coba lagi" : ""}
        </div>
        <div className="qz-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progres">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="qz-count">{done} dari {QUESTIONS.length} terjawab</div>
      </header>

      {step === -1 ? (
        <section className="qz-card qz-hello">
          <h1>Halo Fatwa!</h1>
          <p>Ini beberapa pertanyaan singkat supaya isi situs Kinetic sesuai kenyataan: harga, lama pengerjaan, lisensi, dan cerita tentang kamu.</p>
          <ul>
            <li>Kebanyakan tinggal <b>tap</b> pilihan.</li>
            <li>Semua <b>tersimpan otomatis</b>. Boleh berhenti dan lanjut kapan saja lewat link yang sama.</li>
            <li>Yang belum tahu, pilih <b>“{SKIP}”</b> atau lewati saja.</li>
          </ul>
          <p className="qz-muted">± 5 menit · {SECTIONS.length} bagian</p>
          <button className="qz-btn qz-red" onClick={() => go(0)}>{done > 0 ? "Lanjutkan" : "Mulai"}</button>
        </section>
      ) : step < SECTIONS.length ? (
        <>
          <section className="qz-sec">
            <p className="qz-eyebrow">Bagian {step + 1} dari {SECTIONS.length}</p>
            <h1>{SECTIONS[step].title}</h1>
            {SECTIONS[step].intro ? <p className="qz-muted">{SECTIONS[step].intro}</p> : null}
          </section>
          {SECTIONS[step].questions.map((q, i) => (
            <QuestionCard key={q.key} n={QUESTIONS.indexOf(q) + 1} q={q} a={answers[q.key] ?? {}} onChange={update} first={i === 0} />
          ))}
          <nav className="qz-nav">
            <button className="qz-btn qz-line" onClick={() => go(step - 1)}>Kembali</button>
            <button className="qz-btn qz-red" onClick={() => go(step + 1)}>{step === SECTIONS.length - 1 ? "Selesai" : "Lanjut"}</button>
          </nav>
        </>
      ) : (
        <section className="qz-card qz-hello">
          <h1>Makasih!</h1>
          <p>Jawabanmu sudah tersimpan, Tiyo yang akan mengolahnya.</p>
          {done < QUESTIONS.length ? <p className="qz-muted">Masih ada {QUESTIONS.length - done} yang kosong. Boleh dilengkapi nanti lewat link yang sama.</p> : null}
          <button className="qz-btn qz-line" onClick={() => go(0)}>Lihat lagi jawabanku</button>
        </section>
      )}
    </main>
  );
}

function QuestionCard({ n, q, a, onChange, first }: { n: number; q: Question; a: Answer; onChange: (key: string, a: Answer, delay?: number) => void; first: boolean }) {
  const picks = a.picks ?? [];
  const skipped = picks.includes(SKIP);
  const isText = q.kind === "text" || q.kind === "number";

  const tap = (c: string) => {
    if (c === SKIP) return onChange(q.key, skipped ? {} : { picks: [SKIP] });
    const rest = picks.filter((p) => p !== SKIP);
    if (q.kind === "multi") {
      const next = rest.includes(c) ? rest.filter((p) => p !== c) : [...rest, c];
      return onChange(q.key, { ...a, picks: next });
    }
    // single choice: a pick replaces any "other" text
    return onChange(q.key, rest[0] === c ? {} : { picks: [c] });
  };

  const typeOther = (v: string) => {
    const rest = picks.filter((p) => p !== SKIP);
    if (isText) return onChange(q.key, { text: v }, 700);
    // single choice: typing your own answer replaces the pick
    onChange(q.key, q.kind === "one" ? { other: v } : { picks: rest, other: v }, 700);
  };

  return (
    <fieldset className={`qz-card qz-q${isAnswered(a) ? " is-done" : ""}`}>
      <legend><span className="qz-n">{n}</span>{q.q}</legend>
      {q.note ? <p className="qz-note">{q.note}</p> : null}
      <div className="qz-chips">
        {(q.choices ?? []).map((c) => (
          <button key={c} type="button" className="qz-chip" aria-pressed={picks.includes(c)} onClick={() => tap(c)}>{c}</button>
        ))}
        <button type="button" className="qz-chip qz-skip" aria-pressed={skipped} onClick={() => tap(SKIP)}>{SKIP}</button>
      </div>
      {q.kind === "text" ? (
        <textarea className="qz-input" rows={q.key === "bio" ? 4 : 2} placeholder={q.otherLabel ?? "Tulis di sini"} value={a.text ?? ""} onChange={(e) => typeOther(e.target.value)} autoFocus={false} />
      ) : (
        <input
          className="qz-input"
          inputMode={q.kind === "number" ? "numeric" : undefined}
          placeholder={q.kind === "number" ? (q.otherLabel ?? "") : `${q.otherLabel ?? "Lainnya"}: …`}
          value={(q.kind === "number" ? a.text : a.other) ?? ""}
          onChange={(e) => typeOther(e.target.value)}
          data-first={first || undefined}
        />
      )}
    </fieldset>
  );
}
