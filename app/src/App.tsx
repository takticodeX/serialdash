import { useEffect, useState, type JSX } from 'react';
import { useThemeEffect } from './ui/useThemeEffect';
import { StatusBar } from './ui/StatusBar';
import { UpdateBanner } from './ui/UpdateBanner';
import { ConnectScreen } from './connection/ConnectScreen';
import { UnsupportedBrowser } from './connection/UnsupportedBrowser';
import { ResizableConsole } from './console/ResizableConsole';
import { SettingsPanel } from './settings/SettingsPanel';
import { Dashboard } from './dashboard/Dashboard';
import { useConnectionStore } from './serial/useConnectionStore';
import { useSettingsStore } from './settings/useSettingsStore';
import { useConsoleStore } from './console/useConsoleStore';
import { usePanelLayoutStore } from './console/usePanelLayoutStore';
import { useDashboardLayoutStore } from './dashboard/useDashboardLayoutStore';
import { useWidgetOverridesStore } from './dashboard/useWidgetOverridesStore';
import { isWebSerialSupported } from './serial/webSerialTransport';
import { registerBuiltinWidgets } from './widgets/index';
import { TourOverlay } from './tour/TourOverlay';
import { useTourStore } from './tour/useTourStore';

registerBuiltinWidgets();

export function App(): JSX.Element {
  useThemeEffect();

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const loadSendHistory = useConsoleStore((s) => s.loadSendHistory);
  const hydrateConsoleLayout = usePanelLayoutStore((s) => s.hydrate);
  const hydrateDashboardLayout = useDashboardLayoutStore((s) => s.hydrate);
  const hydrateWidgetOverrides = useWidgetOverridesStore((s) => s.hydrate);
  const hydrateTour = useTourStore((s) => s.hydrate);
  const startTour = useTourStore((s) => s.start);
  const connectionState = useConnectionStore((s) => s.state);
  const session = useConnectionStore((s) => s.session);
  const port = useConnectionStore((s) => s.port);
  const connectToSimulator = useConnectionStore((s) => s.connectToSimulator);
  const supported = isWebSerialSupported();

  const [settingsOpen, setSettingsOpen] = useState(false);
  // SPEC.md §3.5 rule 6: widgets stay visible (dimmed) after a disconnect rather than the app
  // reverting to the connect screen — so that screen is shown only before any session exists, or
  // when the user explicitly asks to switch devices (StatusBar's "change device" action).
  const [showConnectScreen, setShowConnectScreen] = useState(true);

  useEffect(() => {
    void hydrateSettings();
    void loadSendHistory();
    void hydrateConsoleLayout();
    void hydrateDashboardLayout();
    void hydrateWidgetOverrides();
    void hydrateTour();
  }, [
    hydrateSettings,
    loadSendHistory,
    hydrateConsoleLayout,
    hydrateDashboardLayout,
    hydrateWidgetOverrides,
    hydrateTour,
  ]);

  useEffect(() => {
    if (connectionState === 'connected') setShowConnectScreen(false);
  }, [connectionState]);

  if (!supported && !session) {
    return (
      <div className="app-shell">
        <UpdateBanner />
        <UnsupportedBrowser onTryDemo={() => void connectToSimulator()} />
      </div>
    );
  }

  const displayConnectScreen = showConnectScreen || !session;

  return (
    <div className="app-shell">
      <UpdateBanner />
      <StatusBar
        onChangeDevice={session ? () => setShowConnectScreen(true) : undefined}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={startTour}
      />
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      <TourOverlay />

      {displayConnectScreen ? (
        supported ? (
          <ConnectScreen />
        ) : (
          <UnsupportedBrowser onTryDemo={() => void connectToSimulator()} />
        )
      ) : (
        <div className="app-main" style={{ flexDirection: 'column' }}>
          <Dashboard session={session} port={port} />
          <ResizableConsole />
        </div>
      )}
    </div>
  );
}
