import { useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionStore } from '../serial/useConnectionStore';
import { describePort, BAUD_RATE_PRESETS } from '../serial/webSerialTransport';

export function ConnectScreen(): JSX.Element {
  const { t } = useTranslation();
  const knownPorts = useConnectionStore((s) => s.knownPorts);
  const refreshKnownPorts = useConnectionStore((s) => s.refreshKnownPorts);
  const connectToNewPort = useConnectionStore((s) => s.connectToNewPort);
  const connectToPort = useConnectionStore((s) => s.connectToPort);
  const connectToSimulator = useConnectionStore((s) => s.connectToSimulator);
  const options = useConnectionStore((s) => s.options);
  const setOptions = useConnectionStore((s) => s.setOptions);
  const state = useConnectionStore((s) => s.state);
  const error = useConnectionStore((s) => s.error);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customBaud, setCustomBaud] = useState(false);

  useEffect(() => {
    void refreshKnownPorts();
  }, [refreshKnownPorts]);

  const connecting = state === 'connecting';

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <h1>{t('connect.title')}</h1>

      {error === 'portBusy' && (
        <p role="alert" style={{ color: 'var(--color-danger)' }}>
          {t('connect.portBusy')}
        </p>
      )}
      {error && error !== 'portBusy' && (
        <p role="alert" style={{ color: 'var(--color-danger)' }}>
          {t('connect.connectionFailed', { message: error })}
        </p>
      )}

      <section style={{ marginBottom: 24 }}>
        <h2>{t('connect.knownPorts')}</h2>
        {knownPorts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>{t('connect.noKnownPorts')}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {knownPorts.map((port, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  disabled={connecting}
                  onClick={() => void connectToPort(port)}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px' }}
                >
                  {describePort(port).label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <fieldset style={{ marginBottom: 16 }}>
        <legend>{t('connect.baudRate')}</legend>
        {customBaud ? (
          <input
            type="number"
            value={options.baudRate}
            min={1}
            onChange={(e) => setOptions({ baudRate: Number(e.target.value) })}
          />
        ) : (
          <select
            value={options.baudRate}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setCustomBaud(true);
              } else {
                setOptions({ baudRate: Number(e.target.value) });
              }
            }}
          >
            {BAUD_RATE_PRESETS.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
            <option value="custom">{t('connect.baudRateCustom')}</option>
          </select>
        )}
      </fieldset>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={options.resetOnConnect}
          onChange={(e) => setOptions({ resetOnConnect: e.target.checked })}
        />{' '}
        {t('connect.resetOnConnect')}
        <div style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>
          {t('connect.resetOnConnectHint')}
        </div>
      </label>

      <button type="button" onClick={() => setAdvancedOpen((v) => !v)} aria-expanded={advancedOpen}>
        {t('connect.advanced')}
      </button>
      {advancedOpen && (
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <label>
            {t('connect.dataBits')}{' '}
            <select
              value={options.dataBits}
              onChange={(e) => setOptions({ dataBits: Number(e.target.value) as 7 | 8 })}
            >
              <option value={8}>8</option>
              <option value={7}>7</option>
            </select>
          </label>
          <label>
            {t('connect.parity')}{' '}
            <select
              value={options.parity}
              onChange={(e) => setOptions({ parity: e.target.value as 'none' | 'even' | 'odd' })}
            >
              <option value="none">{t('connect.parity_none')}</option>
              <option value="even">{t('connect.parity_even')}</option>
              <option value="odd">{t('connect.parity_odd')}</option>
            </select>
          </label>
          <label>
            {t('connect.stopBits')}{' '}
            <select
              value={options.stopBits}
              onChange={(e) => setOptions({ stopBits: Number(e.target.value) as 1 | 2 })}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </label>
          <label>
            {t('connect.flowControl')}{' '}
            <select
              value={options.flowControl}
              onChange={(e) => setOptions({ flowControl: e.target.value as 'none' | 'hardware' })}
            >
              <option value="none">{t('connect.flowControl_none')}</option>
              <option value="hardware">{t('connect.flowControl_hardware')}</option>
            </select>
          </label>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <button
          type="button"
          disabled={connecting}
          onClick={() => void connectToNewPort()}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1.05em',
            background: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: 8,
            cursor: connecting ? 'default' : 'pointer',
          }}
        >
          {connecting ? t('connect.connecting') : t('connect.connectButton')}
        </button>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button type="button" disabled={connecting} onClick={() => void connectToSimulator()}>
          {t('connect.tryDemo')}
        </button>
      </div>
    </div>
  );
}
