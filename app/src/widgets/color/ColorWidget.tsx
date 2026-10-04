import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { ColorWidget as ColorWidgetDeclaration } from '../../protocol/generated/index.js';

const DEFAULT_COLOR = '#000000';

export function ColorWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<ColorWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const confirmed = series[series.length - 1]?.v;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const displayValue =
    controlState.status === 'pending'
      ? String(controlState.value)
      : typeof confirmed === 'string'
        ? confirmed
        : DEFAULT_COLOR;

  const send = (color: string): void => {
    if (disabled) return;
    if (declaration.confirm && !window.confirm(declaration.confirm)) return;
    session.sendControl(declaration.id, color);
  };

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
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%', flexWrap: 'wrap' }}
        title={errorMessage}
      >
        <input
          type="color"
          value={displayValue}
          disabled={disabled}
          onChange={(e) => send(e.target.value)}
        />
        {declaration.swatches?.map((swatch) => (
          <button
            key={swatch}
            type="button"
            disabled={disabled}
            onClick={() => send(swatch)}
            aria-label={swatch}
            style={{
              width: 18,
              height: 18,
              padding: 0,
              background: swatch,
              border:
                swatch === displayValue
                  ? '2px solid var(--color-text)'
                  : '1px solid var(--color-border)',
            }}
          />
        ))}
      </div>
    </WidgetCard>
  );
}

export function ColorWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<ColorWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="color">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const colorWidgetDemo: WidgetDemo<ColorWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-color',
    k: 'color',
    title: 'LED color',
    swatches: ['#ff0000', '#00ff00', '#0000ff'],
    val: '#ff0000',
  },
  generate: () => ({}),
};
