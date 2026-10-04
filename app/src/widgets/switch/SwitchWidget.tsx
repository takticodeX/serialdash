import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { SwitchWidget as SwitchWidgetDeclaration } from '../../protocol/generated/index.js';

/** SPEC.md §4.3 `switch`: `id` doubles as the state channel (PRT-13). Shows "unknown" (neither
 * position) until a confirmed value exists — no `val` and no `d` yet (§3.6 rule 1). */
export function SwitchWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<SwitchWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const confirmed = series[series.length - 1]?.v;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const displayValue =
    controlState.status === 'pending' ? Boolean(controlState.value) : Boolean(confirmed);
  const unknown = controlState.status !== 'pending' && confirmed === undefined;

  const errorMessage =
    controlState.status === 'error'
      ? controlState.message === 'timeout'
        ? t('widgets.noResponse')
        : controlState.message
      : undefined;

  const toggle = (): void => {
    if (disabled) return;
    const next = !displayValue;
    if (declaration.confirm && !window.confirm(declaration.confirm)) return;
    session.sendControl(declaration.id, next);
  };

  return (
    <WidgetCard
      title={widgetTitle(declaration)}
      stale={false}
      staleLabel={t('widgets.stale')}
      controlStatus={controlState.status}
      disabled={disabled}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}
        title={errorMessage}
      >
        <button
          type="button"
          role="switch"
          aria-checked={unknown ? 'mixed' : displayValue}
          disabled={disabled}
          onClick={toggle}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            position: 'relative',
            background: unknown
              ? 'var(--color-border)'
              : displayValue
                ? 'var(--color-success)'
                : 'var(--color-text-muted)',
            padding: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 2,
              left: unknown ? 10 : displayValue ? 22 : 2,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--color-bg-elevated)',
              transition: 'left 120ms',
            }}
          />
        </button>
        <span>{unknown ? '—' : displayValue ? declaration.on : declaration.off}</span>
      </div>
    </WidgetCard>
  );
}

export function SwitchWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<SwitchWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="switch">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const switchWidgetDemo: WidgetDemo<SwitchWidgetDeclaration> = {
  declaration: { t: 'w', id: 'demo-switch', k: 'switch', title: 'Fan', val: false },
  generate: () => ({}),
};
