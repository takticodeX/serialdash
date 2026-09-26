import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from './useSettingsStore';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { APP_VERSION, PROTOCOL_VERSION } from '../version';

interface Props {
  onClose: () => void;
}

/** §5.8: language, theme, auto-reconnect, auto-discovery, console line limit, control ack
 * timeout, clear local data, about. Plotter compatibility / buffer capacity toggles are still
 * deferred — they configure subsystems (Plotter parser, ChannelStore capacity) that arrive in
 * M6. */
export function SettingsPanel({ onClose }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const autoReconnect = useSettingsStore((s) => s.autoReconnect);
  const setAutoReconnect = useSettingsStore((s) => s.setAutoReconnect);
  const autoDiscovery = useSettingsStore((s) => s.autoDiscovery);
  const setAutoDiscovery = useSettingsStore((s) => s.setAutoDiscovery);
  const consoleLineLimit = useSettingsStore((s) => s.consoleLineLimit);
  const setConsoleLineLimit = useSettingsStore((s) => s.setConsoleLineLimit);
  const ackTimeoutMs = useSettingsStore((s) => s.ackTimeoutMs);
  const setAckTimeoutMs = useSettingsStore((s) => s.setAckTimeoutMs);
  const clearAllLocalData = useSettingsStore((s) => s.clearAllLocalData);

  const handleClearData = (): void => {
    if (window.confirm(t('settings.clearLocalDataConfirm'))) {
      void clearAllLocalData();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('settings.title')}
      className="panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '100%',
        padding: 20,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{t('settings.title')}</h2>
        <button type="button" onClick={onClose} aria-label={t('common.close')}>
          ✕
        </button>
      </div>

      <label style={{ display: 'block', marginTop: 20 }}>
        {t('settings.language')}
        <select
          value={i18n.language}
          onChange={(e) => void i18n.changeLanguage(e.target.value)}
          style={{ display: 'block', marginTop: 4 }}
        >
          {SUPPORTED_LANGUAGES.map((lng) => (
            <option key={lng} value={lng}>
              {lng.toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', marginTop: 16 }}>
        {t('settings.theme')}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
          style={{ display: 'block', marginTop: 4 }}
        >
          <option value="auto">{t('settings.theme_auto')}</option>
          <option value="light">{t('settings.theme_light')}</option>
          <option value="dark">{t('settings.theme_dark')}</option>
        </select>
      </label>

      <label style={{ display: 'block', marginTop: 16 }}>
        <input
          type="checkbox"
          checked={autoReconnect}
          onChange={(e) => setAutoReconnect(e.target.checked)}
        />{' '}
        {t('settings.autoReconnect')}
      </label>

      <label style={{ display: 'block', marginTop: 16 }}>
        <input
          type="checkbox"
          checked={autoDiscovery}
          onChange={(e) => setAutoDiscovery(e.target.checked)}
        />{' '}
        {t('settings.autoDiscovery')}
      </label>

      <label style={{ display: 'block', marginTop: 16 }}>
        {t('settings.consoleLineLimit')}
        <input
          type="number"
          min={100}
          step={100}
          value={consoleLineLimit}
          onChange={(e) => setConsoleLineLimit(Number(e.target.value))}
          style={{ display: 'block', marginTop: 4, width: '100%' }}
        />
      </label>

      <label style={{ display: 'block', marginTop: 16 }}>
        {t('settings.ackTimeoutMs')}
        <input
          type="number"
          min={100}
          step={100}
          value={ackTimeoutMs}
          onChange={(e) => setAckTimeoutMs(Number(e.target.value))}
          style={{ display: 'block', marginTop: 4, width: '100%' }}
        />
      </label>

      <button type="button" onClick={handleClearData} style={{ marginTop: 24 }}>
        {t('settings.clearLocalData')}
      </button>

      <h3 style={{ marginTop: 24 }}>{t('settings.about')}</h3>
      <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
        {t('settings.aboutAppVersion')}: {APP_VERSION}
        <br />
        {t('settings.aboutProtocolVersion')}: {PROTOCOL_VERSION}
      </p>
    </div>
  );
}
