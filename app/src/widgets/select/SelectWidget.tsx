import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { SelectWidget as SelectWidgetDeclaration } from '../../protocol/generated/index.js';

function normalizeOpts(opts: (string | [string, string])[] | undefined): [string, string][] {
  return (opts ?? []).map((o) => (Array.isArray(o) ? o : [o, o]));
}

export function SelectWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<SelectWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const confirmed = series[series.length - 1]?.v;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;
  const opts = normalizeOpts(declaration.opts);

  const displayValue =
    controlState.status === 'pending' ? String(controlState.value) : String(confirmed ?? '');

  const errorMessage =
    controlState.status === 'error'
      ? controlState.message === 'timeout'
        ? t('widgets.noResponse')
        : controlState.message
      : undefined;

  return (
    <WidgetCard
      title={widgetTitle(declaration)}
      stale={false}
      staleLabel={t('widgets.stale')}
      controlStatus={controlState.status}
      disabled={disabled}
    >
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }} title={errorMessage}>
        <select
          value={displayValue}
          disabled={disabled}
          onChange={(e) => {
            if (declaration.confirm && !window.confirm(declaration.confirm)) return;
            session.sendControl(declaration.id, e.target.value);
          }}
          style={{ width: '100%' }}
        >
          {!opts.some(([value]) => value === displayValue) && (
            <option value={displayValue}>{displayValue}</option>
          )}
          {opts.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </WidgetCard>
  );
}

export function SelectWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<SelectWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="select">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const selectWidgetDemo: WidgetDemo<SelectWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-select',
    k: 'select',
    title: 'Mode',
    opts: ['auto', 'manual'],
    val: 'auto',
  },
  generate: () => ({}),
};
