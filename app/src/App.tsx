import { useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeEffect } from './ui/useThemeEffect';
import { StatusBar } from './ui/StatusBar';
import { UpdateBanner } from './ui/UpdateBanner';
import { ConnectScreen } from './connection/ConnectScreen';
import { UnsupportedBrowser } from './connection/UnsupportedBrowser';
import { ResizableConsole } from './console/ResizableConsole';
import { SettingsPanel } from './settings/SettingsPanel';
import { useConnectionStore } from './serial/useConnectionStore';
import { useSettingsStore } from './settings/useSettingsStore';
import { useConsoleStore } from './console/useConsoleStore';
import { usePanelLayoutStore } from './console/usePanelLayoutStore';
import { isWebSerialSupported } from './serial/webSerialTransport';

export function App(): JSX.Element {
  const { t } = useTranslation();
  useThemeEffect();

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const loadSendHistory = useConsoleStore((s) => s.loadSendHistory);
  const hydrateLayout = usePanelLayoutStore((s) => s.hydrate);
  const connectionState = useConnectionStore((s) => s.state);

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    void hydrateSettings();
    void loadSendHistory();
    void hydrateLayout();
  }, [hydrateSettings, loadSendHistory, hydrateLayout]);

  if (!isWebSerialSupported()) {
    return (
      <div className="app-shell">
        <UpdateBanner />
        <UnsupportedBrowser />
      </div>
    );
  }

  const connected = connectionState === 'connected' || connectionState === 'disconnecting';

  return (
    <div className="app-shell">
      <UpdateBanner />
      <StatusBar />
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label={t('settings.title')}
        style={{ position: 'fixed', top: 8, right: 8, zIndex: 5 }}
      >
        ⚙
      </button>
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      {connected ? (
        <div className="app-main" style={{ flexDirection: 'column' }}>
          <ResizableConsole />
        </div>
      ) : (
        <ConnectScreen />
      )}
    </div>
  );
}
