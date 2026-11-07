/** Squeegee ink wipe that uncovers every page except Home (CSS-only, ends hidden). */
export default function PageIn() {
  return (
    <div id="pagein" aria-hidden="true"><div id="pagein-ink" /><div id="pagein-sq" /></div>
  );
}
