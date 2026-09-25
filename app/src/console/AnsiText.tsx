import { Fragment, type JSX } from 'react';
import { parseAnsi } from './ansi';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Splits `text` on case-insensitive `query` matches, wrapping hits in <mark> — used for
 * APP-CSL-04's search highlighting. Pure React elements, never dangerouslySetInnerHTML
 * (APP-NFR-06: device text is untrusted). */
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string | undefined;
}): JSX.Element {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() && part.length > 0 ? (
          <mark className="console-mark" key={i}>
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function AnsiText({ text, highlight }: { text: string; highlight?: string }): JSX.Element {
  const segments = parseAnsi(text);
  return (
    <>
      {segments.map((seg, i) => (
        <span
          key={i}
          style={{
            fontWeight: seg.bold ? 700 : undefined,
            color: seg.fg ? `var(--ansi-${seg.fg})` : undefined,
            backgroundColor: seg.bg ? `var(--ansi-${seg.bg})` : undefined,
          }}
        >
          <HighlightedText text={seg.text} query={highlight} />
        </span>
      ))}
    </>
  );
}
