import type { ReactNode } from "react";
import type { CommonDict } from "@/i18n/common";
import { serviceIcons } from "./Icons";

export default function Services({ c, count = 4, id = "services", eyebrow, title, side }: {
  c: CommonDict; count?: 4 | 6; id?: string; eyebrow?: string; title?: string; side?: ReactNode;
}) {
  return (
    <section id={id} className="sec">
      <div className="wrap">
        {title ? (
          <div className="sec-head">
            <div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2 className="disp h2 rough">{title}</h2></div>
            {side}
          </div>
        ) : null}
        <ul className={"svc-list" + (count === 6 ? " six" : "")}>
          {c.services.slice(0, count).map((s, i) => {
            const Icon = serviceIcons[s.key as keyof typeof serviceIcons] ?? Object.values(serviceIcons)[i % 6];
            const key = s.key || `s${i}`;
            return (
              <li key={key} id={`svc-${key}`}>
                <span className="svc-icon"><Icon /></span>
                <div><h3>{s.title}</h3><p>{s.desc}</p></div>
                <span className="svc-no">0{i + 1}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
