import { useMemo, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigField, WidgetCard, useSessionVersion, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { LogWidget as LogWidgetDeclaration } from '../../protocol/generated/index.js';

const LEVEL_ORDER = { debug: 0, info: 1, warn: 2, err: 3 } as const;
type Level = keyof typeof LEVEL_ORDER;

const LEVEL_COLOR: Record<Level, string> = {
  debug: 'var(--color-text-muted)',
  info: 'var(--color-text)',
  warn: 'var(--color-warning)',
  err: 'var(--color-danger)',
};

const DEFAULT_MAX_ROWS = 500;

/** SPEC.md §4.1: doesn't use `ch` — reads events straight from DeviceSession. */
export function LogWidgetComponent({
  declaration,
  session,
}: WidgetComponentProps<LogWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  // The return value matters here, not just the re-render: session.getEvents() below reads
  // mutable state the useMemo dependency array can't see through `session` alone (that reference
  // never changes) — `version` is what actually changes on every new event, so it must be a dep.
  const version = useSessionVersion(session);

  const minLevel: Level = declaration.lvl ?? 'info';
  const maxRows = declaration.max ?? DEFAULT_MAX_ROWS;

  const rows = useMemo(() => {
    const events = session.getEvents();
    const filtered = events.filter((e) => {
      const level = (e.lvl ?? 'info') as Level;
      if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return false;
      if (
        declaration.src &&
        declaration.src.length > 0 &&
        (!e.src || !declaration.src.includes(e.src))
      ) {
        return false;
      }
      return true;
    });
    return filtered.slice(-maxRows);
    // version isn't read in the body above, but session.getEvents() reads mutable state that
    // only `version` changing actually signals (see the comment on its declaration).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, version, minLevel, maxRows, declaration.src]);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={false} staleLabel={t('widgets.stale')}>
      <div
        style={{
          overflowY: 'auto',
          height: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85em',
        }}
      >
        {rows.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>{t('console.empty')}</p>
        ) : (
          rows.map((e, i) => (
            <div key={i} style={{ color: LEVEL_COLOR[(e.lvl ?? 'info') as Level] }}>
              {e.src && <span style={{ opacity: 0.7 }}>[{e.src}] </span>}
              {e.msg}
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
}

export function LogWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<LogWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="log">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
      <ConfigField label="Min level" kind="log" prop="lvl">
        <select
          value={declaration.lvl ?? 'info'}
          onChange={(e) => onChange({ lvl: e.target.value as Level })}
        >
          <option value="debug">debug</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="err">err</option>
        </select>
      </ConfigField>
    </div>
  );
}

export const logWidgetDemo: WidgetDemo<LogWidgetDeclaration> = {
  declaration: { t: 'w', id: 'demo-log', k: 'log', title: 'Events' },
  // The log widget has no channels of its own — the simulator sends `e` messages separately, so
  // this returns nothing to funnel through the normal `d` channel path.
  generate: () => ({}),
};
