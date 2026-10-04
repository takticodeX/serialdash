import type { CSSProperties, JSX, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionStore } from '../serial/useConnectionStore';
import { useDeviceSession } from '../session/useDeviceSession';
import { useConsoleStore } from '../console/useConsoleStore';

type ChipTone = 'neutral' | 'success' | 'accent' | 'danger' | 'warning';

const CHIP_TONE_VAR: Record<ChipTone, string> = {
  neutral: '--color-text-muted',
  success: '--color-success',
  accent: '--color-accent',
  danger: '--color-danger',
  warning: '--color-warning',
};

/** One visually-grouped cluster of related status info (connection state, port/device, traffic).
 * A tinted pill rather than plain inline text, so the header actually reads as distinct groups
 * at a glance instead of one long run-on line. */
function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }): JSX.Element {
  const colorVar = `var(${CHIP_TONE_VAR[tone]})`;
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: '0.85em',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    background: `color-mix(in srgb, ${colorVar} 14%, var(--color-bg-elevated))`,
    border: `1px solid color-mix(in srgb, ${colorVar} 32%, transparent)`,
  };
  return <span style={style}>{children}</span>;
}

/**
 * APP-CON-06: connection state, port, baud rate, device name (from `hi`), byte/s, lines/s, a
 * clickable protocol-error count that filters the console to errors only, and (since M4) the
 * average `ack`/`pong` latency plus a "device not responding" indicator after 3 missed pings
 * (SPEC.md §3.5 rule 5).
 *
 * Grouped into tinted, spaced-out chips rather than one run of plain text — connection state,
 * port/baud/device, and live traffic each read as their own cluster now. The single disconnect
 * action here also serves as APP-CON-08 ("disconnect to upload a sketch"): there is no other
 * disconnect path, and both are the same operation (free the port; it reconnects automatically
 * once the board reappears, if enabled), so one labeled, tooltipped button covers both rather
 * than showing two buttons that would do the exact same thing. Settings lives in this same flex
 * row (not a `position: fixed` overlay, as it used to be) — the overlay could land on top of and
 * visually swallow this row's own rightmost button once the row got long enough.
 */
interface Props {
  /** Present once a session has ever existed — lets the user leave the dashboard (which stays
   * visible after a disconnect, SPEC.md §3.5 rule 6) to pick a different device. */
  onChangeDevice: (() => void) | undefined;
  onOpenSettings: () => void;
  /** DOC-32: replays the first-run tour from its first step. */
  onOpenHelp: () => void;
}

export function StatusBar({ onChangeDevice, onOpenSettings, onOpenHelp }: Props): JSX.Element {
  const { t } = useTranslation();
  const state = useConnectionStore((s) => s.state);
  const info = useConnectionStore((s) => s.info);
  const port = useConnectionStore((s) => s.port);
  const options = useConnectionStore((s) => s.options);
  const throughput = useConnectionStore((s) => s.throughput);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const connectToPort = useConnectionStore((s) => s.connectToPort);
  const session = useDeviceSession();
  const setErrorsOnly = useConsoleStore((s) => s.setErrorsOnly);

  const deviceInfo = session?.getDeviceInfo();
  const liveness = session?.getStatus() === 'handshaked' ? session.getLiveness() : undefined;
  const connected = state === 'connected';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        padding: '10px 12px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <strong style={{ marginRight: 2 }}>{t('common.appName')}</strong>

      <Chip tone={connected ? 'success' : 'neutral'}>
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? 'var(--color-success)' : 'var(--color-text-muted)',
            display: 'inline-block',
          }}
        />
        <span aria-live="polite">{t(`statusBar.${state}`)}</span>
      </Chip>

      {info && (
        <Chip tone="accent">
          {t('statusBar.port')}: {info.label}
          {connected && (
            <>
              {' · '}
              {options.baudRate} {t('statusBar.baud')}
            </>
          )}
          {deviceInfo && <> · {deviceInfo.name}</>}
        </Chip>
      )}

      {connected && (
        <Chip tone="neutral">
          {throughput.bytesPerSecond} B/s · {throughput.linesPerSecond}{' '}
          {t('statusBar.linesPerSecond')}
          {liveness && !liveness.notResponding && liveness.latencyMs !== undefined && (
            <> · {t('statusBar.latency', { ms: liveness.latencyMs })}</>
          )}
        </Chip>
      )}

      {liveness?.notResponding && <Chip tone="danger">{t('statusBar.notResponding')}</Chip>}

      {throughput.protocolErrorCount > 0 && (
        <button
          type="button"
          onClick={() => setErrorsOnly(true)}
          title={t('statusBar.protocolErrorsHint')}
          style={{
            color: 'var(--color-danger)',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: '0.85em',
          }}
        >
          {t('statusBar.protocolErrors', { count: throughput.protocolErrorCount })}
        </button>
      )}

      <span style={{ flex: 1 }} />

      {state === 'disconnected' && port && (
        <button type="button" onClick={() => void connectToPort(port)}>
          {t('statusBar.reconnect')}
        </button>
      )}
      {onChangeDevice && (
        <button type="button" onClick={onChangeDevice}>
          {t('statusBar.changeDevice')}
        </button>
      )}
      {connected && (
        <button
          type="button"
          onClick={() => void disconnect()}
          title={t('connect.disconnectToFlashHint')}
        >
          {t('connect.disconnectToFlash')}
        </button>
      )}
      <button
        type="button"
        onClick={onOpenHelp}
        aria-label={t('tour.openHelp')}
        title={t('tour.openHelp')}
        data-tour="open-help"
      >
        ?
      </button>
      <button type="button" onClick={onOpenSettings} aria-label={t('settings.title')}>
        ⚙
      </button>
    </div>
  );
}
