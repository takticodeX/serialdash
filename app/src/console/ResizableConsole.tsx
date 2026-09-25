import { useCallback, useRef, type JSX, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConsolePanel } from './ConsolePanel';
import { usePanelLayoutStore } from './usePanelLayoutStore';

const MIN_SIZE = 160;
const MAX_SIZE = 900;

/**
 * APP-CSL-10: resizable + collapsible console panel, persisted. The "docked beside or below the
 * dashboard" choice is meaningful once M2 adds a dashboard to dock against — until then this is a
 * standalone resizable/collapsible pane (drag the handle, or collapse it to just the toolbar).
 */
export function ResizableConsole(): JSX.Element {
  const { t } = useTranslation();
  const sizePx = usePanelLayoutStore((s) => s.sizePx);
  const setSizePx = usePanelLayoutStore((s) => s.setSizePx);
  const collapsed = usePanelLayoutStore((s) => s.collapsed);
  const toggleCollapsed = usePanelLayoutStore((s) => s.toggleCollapsed);

  const dragState = useRef<{ startY: number; startSize: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      dragState.current = { startY: e.clientY, startSize: sizePx };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [sizePx],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const delta = dragState.current.startY - e.clientY;
      const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, dragState.current.startSize + delta));
      setSizePx(next);
    },
    [setSizePx],
  );

  const onPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: collapsed ? 'auto' : sizePx,
        flexShrink: 0,
        minHeight: 0,
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="separator"
        aria-orientation="horizontal"
        aria-label={t('console.title')}
        style={{
          height: 6,
          cursor: collapsed ? 'default' : 'ns-resize',
          touchAction: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '2px 8px',
        }}
      >
        <button type="button" onClick={toggleCollapsed} aria-expanded={!collapsed}>
          {collapsed ? '▸' : '▾'} {t('console.title')}
        </button>
      </div>
      {!collapsed && <ConsolePanel />}
    </div>
  );
}
