import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { ConsoleLine } from './useConsoleStore';
import { AnsiText } from './AnsiText';
import { toHexDump } from './hex';

const ROW_HEIGHT = 20;
const OVERSCAN = 8;
const BOTTOM_THRESHOLD = 32;

function formatTs(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number, w = 2): string => n.toString().padStart(w, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

interface Props {
  lines: ConsoleLine[];
  showTimestamps: boolean;
  wrap: boolean;
  hexView: boolean;
  search: string;
  paused: boolean;
  pendingWhilePaused: number;
  onPausedChange: (paused: boolean) => void;
}

/**
 * APP-CSL-02: virtualized list — only rows in (and near) the visible window are mounted, so this
 * stays smooth at tens of thousands of lines. Fixed row height keeps the math simple; wrapped
 * lines (APP-CSL-03) intentionally trade exact height for that simplicity — acceptable since wrap
 * is off by default and used for occasional inspection, not the default reading mode.
 */
export function ConsoleLineList({
  lines,
  showTimestamps,
  wrap,
  hexView,
  search,
  paused,
  pendingWhilePaused,
  onPausedChange,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return lines;
    const q = search.toLowerCase();
    return lines.filter((l) => l.text.toLowerCase().includes(q));
  }, [lines, search]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    ro.observe(el);
    setViewportHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Autoscroll: stick to the bottom as new lines arrive, unless the user scrolled up (paused).
  useEffect(() => {
    if (paused) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filtered.length, paused]);

  const handleScroll = (): void => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    if (atBottom && paused) onPausedChange(false);
    else if (!atBottom && !paused) onPausedChange(true);
  };

  const jumpToBottom = (): void => {
    onPausedChange(false);
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const total = filtered.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(total, startIndex + visibleCount);
  const visible = filtered.slice(startIndex, endIndex);

  return (
    <div className="console" style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="off"
        aria-label={t('console.title')}
        style={{ height: '100%', overflowY: 'auto' }}
      >
        {total === 0 ? (
          <p style={{ padding: '0.75em', color: 'var(--console-muted)' }}>{t('console.empty')}</p>
        ) : (
          <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
            {visible.map((line, i) => (
              <div
                key={line.id}
                className="console-line"
                data-wrap={wrap}
                style={{ position: 'absolute', top: (startIndex + i) * ROW_HEIGHT, width: '100%' }}
              >
                {showTimestamps && <span className="console-line-ts">{formatTs(line.ts)}</span>}
                <span className="console-line-dir" aria-hidden="true">
                  {line.dir === 'tx' ? '→' : '←'}
                </span>
                <span>
                  {hexView ? toHexDump(line.raw) : <AnsiText text={line.text} highlight={search} />}
                  {line.truncated && (
                    <span style={{ color: 'var(--ansi-red)' }}>
                      {' '}
                      [{t('console.title')}: truncated]
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {paused && pendingWhilePaused > 0 && (
        <button
          type="button"
          onClick={jumpToBottom}
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--console-accent)',
            color: 'var(--console-bg)',
            border: 'none',
            borderRadius: 999,
            padding: '6px 14px',
            cursor: 'pointer',
          }}
        >
          {t('console.newLines')} ({pendingWhilePaused})
        </button>
      )}
    </div>
  );
}
