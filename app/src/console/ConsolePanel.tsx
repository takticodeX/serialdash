import { useCallback, type JSX } from 'react';
import { ConsoleToolbar } from './ConsoleToolbar';
import { ConsoleLineList } from './ConsoleLineList';
import { ConsoleSendBar } from './ConsoleSendBar';
import { encodeEol, useConsoleStore } from './useConsoleStore';
import { useConnectionStore } from '../serial/useConnectionStore';

export function ConsolePanel(): JSX.Element {
  const lines = useConsoleStore((s) => s.lines);
  const showTimestamps = useConsoleStore((s) => s.showTimestamps);
  const wrap = useConsoleStore((s) => s.wrap);
  const hexView = useConsoleStore((s) => s.hexView);
  const search = useConsoleStore((s) => s.search);
  const paused = useConsoleStore((s) => s.paused);
  const pendingWhilePaused = useConsoleStore((s) => s.pendingWhilePaused);
  const setPaused = useConsoleStore((s) => s.setPaused);
  const eol = useConsoleStore((s) => s.eol);
  const addLine = useConsoleStore((s) => s.addLine);

  const transport = useConnectionStore((s) => s.transport);
  const connectionState = useConnectionStore((s) => s.state);

  const handleSend = useCallback(
    (text: string) => {
      if (!transport) return;
      const withEol = text + encodeEol(eol);
      const raw = new TextEncoder().encode(withEol);
      void transport.write(raw);
      addLine('tx', { text, raw: new TextEncoder().encode(text), truncated: false });
    },
    [transport, eol, addLine],
  );

  return (
    <div
      className="panel"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      <ConsoleToolbar />
      <ConsoleLineList
        lines={lines}
        showTimestamps={showTimestamps}
        wrap={wrap}
        hexView={hexView}
        search={search}
        paused={paused}
        pendingWhilePaused={pendingWhilePaused}
        onPausedChange={setPaused}
      />
      <ConsoleSendBar disabled={connectionState !== 'connected'} onSend={handleSend} />
    </div>
  );
}
