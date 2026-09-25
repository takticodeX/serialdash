import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionStore } from '../serial/useConnectionStore';
import { useDeviceSession } from '../session/useDeviceSession';
import { useConsoleStore } from '../console/useConsoleStore';

/**
 * APP-CON-06: connection state, port, baud rate, device name (from `hi`), byte/s, lines/s, and a
 * clickable protocol-error count that filters the console to errors only. Ack latency stays
 * deferred to M4 (needs ping/pong, which SPEC.md assigns there, not here).
 *
 * The single disconnect action here also serves as APP-CON-08 ("disconnect to upload a sketch"):
 * there is no other disconnect path, and both are the same operation (free the port; it
 * reconnects automatically once the board reappears, if enabled), so one labeled, tooltipped
 * button covers both rather than showing two buttons that would do the exact same thing.
 */
interface Props {
  /** Present once a session has ever existed — lets the user leave the dashboard (which stays
   * visible after a disconnect, SPEC.md §3.5 rule 6) to pick a different device. */
  onChangeDevice: (() => void) | undefined;
}

export function StatusBar({ onChangeDevice }: Props): JSX.Element {
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '8px 12px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <strong>{t('common.appName')}</strong>

      <span
        aria-live="polite"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: state === 'connected' ? 'var(--color-success)' : 'var(--color-text-muted)',
            display: 'inline-block',
          }}
        />
        {t(`statusBar.${state}`)}
      </span>

      {info && (
        <span>
          {t('statusBar.port')}: {info.label}
        </span>
      )}
      {state === 'connected' && (
        <span>
          {options.baudRate} {t('statusBar.baud')}
        </span>
      )}
      {deviceInfo && <span>{deviceInfo.name}</span>}
      {state === 'connected' && (
        <>
          <span>{throughput.bytesPerSecond} B/s</span>
          <span>
            {throughput.linesPerSecond} {t('statusBar.linesPerSecond')}
          </span>
        </>
      )}
      {throughput.protocolErrorCount > 0 && (
        <button
          type="button"
          onClick={() => setErrorsOnly(true)}
          title={t('statusBar.protocolErrorsHint')}
          style={{ color: 'var(--color-danger)' }}
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
      {state === 'connected' && (
        <button
          type="button"
          onClick={() => void disconnect()}
          title={t('connect.disconnectToFlashHint')}
        >
          {t('connect.disconnectToFlash')}
        </button>
      )}
    </div>
  );
}
