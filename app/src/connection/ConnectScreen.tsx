import { useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionStore } from '../serial/useConnectionStore';
import { describePort, BAUD_RATE_PRESETS } from '../serial/webSerialTransport';
import type { SimulatorScenario } from '../transport/simulatorTransport';
import logo from '../assets/serialdash-logo.png';
import { docsUrl } from '../docsUrl';

// APP-SIM-02. Values are `connect.scenario_*` i18n keys (APP-GEN-04: no literal UI strings).
const SIMULATOR_SCENARIOS: [SimulatorScenario, string][] = [
  ['all-widgets', 'connect.scenario_allWidgets'],
  ['weather-station', 'connect.scenario_weatherStation'],
  ['motor-control', 'connect.scenario_motorControl'],
  ['protocol-errors', 'connect.scenario_protocolErrors'],
  ['stress-test', 'connect.scenario_stressTest'],
];

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
  const [scenario, setScenario] = useState<SimulatorScenario>('all-widgets');

  useEffect(() => {
    void refreshKnownPorts();
  }, [refreshKnownPorts]);

  const connecting = state === 'connecting';

  const headingStyle = { fontSize: '2em', fontWeight: 700, margin: '0.2em 0' };

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: '0 16px' }}>
      <img
        src={logo}
        alt=""
        width={64}
        height={64}
        style={{ display: 'block', margin: '0 auto 8px' }}
      />
      <p style={{ ...headingStyle, textAlign: 'center' }}>{t('common.appName')}</p>
      <h1 style={{ ...headingStyle, textAlign: 'center', marginBottom: 16 }}>
        {t('connect.title')}{' '}
        <a
          href={docsUrl('guide/connecting')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('connect.howToConnect')}
          title={t('connect.howToConnect')}
          style={{
            fontSize: '0.5em',
            fontWeight: 400,
            verticalAlign: 'middle',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.6em',
            height: '1.6em',
          }}
        >
          ?
        </a>
      </h1>

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

      <section className="panel" style={{ padding: 12, marginBottom: 12 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1em' }}>{t('connect.knownPorts')}</h2>
        {knownPorts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{t('connect.noKnownPorts')}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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

      <section
        className="panel"
        style={{
          padding: 12,
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('connect.baudRate')}
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
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={options.resetOnConnect}
            onChange={(e) => setOptions({ resetOnConnect: e.target.checked })}
          />
          {t('connect.resetOnConnect')}
        </label>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
        >
          {t('connect.advanced')}
        </button>
        {advancedOpen && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
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
      </section>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <button
          type="button"
          disabled={connecting}
          onClick={() => void connectToNewPort()}
          style={{
            padding: '8px 24px',
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

      <section
        className="panel"
        style={{
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('connect.scenario')}
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as SimulatorScenario)}
          >
            {SIMULATOR_SCENARIOS.map(([value, labelKey]) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={connecting}
          onClick={() => void connectToSimulator(scenario)}
          data-tour="connect-simulator"
        >
          {t('connect.tryDemo')}
        </button>
      </section>
    </div>
  );
}
