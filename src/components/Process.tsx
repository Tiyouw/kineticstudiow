import type { ReactNode } from "react";
import type { CommonDict } from "@/i18n/common";

/** The 4 steps with the line drawing between them. `delay` is when the line starts (CSS --pd). */
export default function Process({ c, title, eyebrow, side, delay = "0.4s", id = "process" }: {
  c: CommonDict; title: ReactNode; eyebrow?: string; side?: ReactNode; delay?: string; id?: string;
}) {
  return (
    <section id={id} className="sec" style={{ ["--pd" as string]: delay }}>
      <div className="wrap">
        <div className="sec-head">
          <div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2 className="disp h2 rough">{title}</h2></div>
          {side}
        </div>
        <ol className="steps">
          <span className="p-line" aria-hidden="true" />
          {c.steps.map((s, i) => (
            <li key={i} id={`step-${i + 1}`} style={{ ["--k" as string]: i }}>
              <span className="step-no">{i + 1}</span>
              <div><h3>{s.title}</h3><p>{s.desc}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
