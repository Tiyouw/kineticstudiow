import { forwardRef, type DetailedHTMLProps, type HTMLAttributes } from "react";

type MarkAttrs = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  motion?: "none" | "intro" | "hinge" | "slide" | "punch" | "snap";
  trigger?: "load" | "view" | "hover" | "manual";
  hover?: "none" | "replay" | "eyes";
  wordmark?: "" | undefined;
  delay?: string;
  label?: string;
};

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "tiyoouw-mark": MarkAttrs;
    }
  }
}

/** Tiyo's studio mark (web component from /tiyoouw-mark.js, loaded once in the layout). */
const TiyoouwMark = forwardRef<HTMLElement, MarkAttrs>(function TiyoouwMark(props, ref) {
  return <tiyoouw-mark label="tiyoouw" {...props} ref={ref} />;
});
export default TiyoouwMark;
