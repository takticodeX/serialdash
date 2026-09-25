import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionStore } from '../serial/useConnectionStore';

/**
 * APP-CON-06 (M1 slice only): connection state, port, baud rate. Device name (from `hi`),
 * throughput, protocol error count, and ack latency all depend on DeviceSession/Parser, which
 * arrive in M2 — see the M1 plan's flagged scope reduction.
 *
 * The single disconnect action here also serves as APP-CON-08 ("disconnect to upload a sketch"):
 * in M1 there is no other disconnect path, and both are the same operation (free the port; it
 * reconnects automatically once the board reappears, if enabled), so one labeled, tooltipped
 * button covers both rather than showing two buttons that would do the exact same thing.
 */
export function StatusBar(): JSX.Element {
  const { t } = useTranslation();
  const state = useConnectionStore((s) => s.state);
  const info = useConnectionStore((s) => s.info);
  const options = useConnectionStore((s) => s.options);
  const disconnect = useConnectionStore((s) => s.disconnect);

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

      <span style={{ flex: 1 }} />

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
