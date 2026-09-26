import { useEffect, useState, type JSX, type ReactNode } from 'react';
import type { WidgetDeclaration } from '../protocol/generated/index.js';
import type { DeviceSession } from '../session/DeviceSession';
import { useConnectionStore } from '../serial/useConnectionStore';

const DEFAULT_STALE_SECONDS = 5;

/** Re-renders the caller on every DeviceSession notification (e.g. new `e` events) — used by
 * widgets that read straight from the session rather than ChannelStore, like `log`. */
export function useSessionVersion(session: DeviceSession): number {
  const [version, setVersion] = useState(0);
  useEffect(() => session.subscribe(() => setVersion((n) => n + 1)), [session]);
  return version;
}

/** SPEC.md §4.1: every widget dims and shows "stale" once its data is older than 5s (or the
 * widget's own `stale` property). */
export function useStale(
  latestTs: number | undefined,
  staleSeconds = DEFAULT_STALE_SECONDS,
): boolean {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (latestTs === undefined) {
      setStale(false);
      return;
    }
    const check = (): void => setStale(Date.now() - latestTs > staleSeconds * 1000);
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [latestTs, staleSeconds]);

  return stale;
}

/** SPEC.md §3.6: controls are disabled while the device is disconnected, in addition to their own
 * `dis` property (checked separately by each control widget). */
export function useConnected(): boolean {
  return useConnectionStore((s) => s.state === 'connected');
}

export function widgetTitle(declaration: WidgetDeclaration): string {
  return declaration.title ?? declaration.id;
}

interface WidgetCardProps {
  title: string;
  stale: boolean;
  staleLabel: string;
  children: ReactNode;
  /** SPEC.md §3.6: only set by control widgets (button/switch/slider) — 'idle' renders no extra
   * border, 'pending'/'error' draw the animated dashed / solid danger border from theme.css. */
  controlStatus?: 'idle' | 'pending' | 'error';
  /** `dis` on the declaration, or the connection being down (§3.6's fourth control state). */
  disabled?: boolean;
}

/** Common chrome shared by every widget: title, stale dimming, and (for controls) the
 * pending/error/disabled visual states of SPEC.md §3.6. */
export function WidgetCard({
  title,
  stale,
  staleLabel,
  children,
  controlStatus,
  disabled,
}: WidgetCardProps): JSX.Element {
  return (
    <div
      className={controlStatus ? 'panel control-card' : 'panel'}
      data-stale={stale}
      data-control-status={controlStatus}
      data-control-disabled={disabled}
      title={stale ? staleLabel : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 8,
        opacity: stale ? 0.5 : disabled ? 0.5 : 1,
        transition: 'opacity 200ms',
      }}
    >
      <div
        style={{
          fontSize: '0.8em',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>{children}</div>
    </div>
  );
}

/** A widget's first `ch` entry as a single string — most P0 widgets bind to exactly one channel. */
export function primaryChannel(ch: string | [string, ...string[]] | undefined): string | undefined {
  if (!ch) return undefined;
  return Array.isArray(ch) ? ch[0] : ch;
}
