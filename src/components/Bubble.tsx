import { TicksIcon } from "./Icons";

/** WhatsApp message preview, styled as a printed chat bubble. */
export default function Bubble({ text, head, to, meta, cap, live, typing, id }: {
  text: string; head: string; to: string; meta: string; cap?: string; live?: boolean; typing?: boolean; id?: string;
}) {
  return (
    <>
      {cap ? <p className="bubble-cap">{cap}</p> : null}
      <div className={"bubble" + (typing ? " is-typing" : "")} id={id} data-live={live ? "" : undefined} aria-live={live ? "polite" : undefined}>
        <p className="bubble-head"><span>{head}</span><span>{to}</span></p>
        <p className="bubble-text">{text}</p>
        <div className="bubble-meta">
          <span className="typing" aria-hidden="true"><i /><i /><i /></span>
          <span>{meta}</span>
          <TicksIcon />
        </div>
      </div>
    </>
  );
}
