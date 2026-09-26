import { useEffect, useState, type JSX, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { NumberWidget as NumberWidgetDeclaration } from '../../protocol/generated/index.js';

/** SPEC.md §4.3 `number`: sent on Enter or blur, not on every keystroke. */
export function NumberWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<NumberWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const confirmed = series[series.length - 1]?.v;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const [draft, setDraft] = useState<string>('');
  useEffect(() => {
    if (controlState.status !== 'pending') {
      setDraft(typeof confirmed === 'number' ? String(confirmed) : '');
    }
  }, [confirmed, controlState.status]);

  const commit = (): void => {
    if (disabled) return;
    const next = Number(draft);
    if (Number.isNaN(next)) return;
    if (declaration.confirm && !window.confirm(declaration.confirm)) return;
    session.sendControl(declaration.id, next);
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
        style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}
        title={errorMessage}
      >
        <input
          type="number"
          min={declaration.min}
          max={declaration.max}
          step={declaration.step ?? 1}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') commit();
          }}
          style={{ width: '100%' }}
        />
        {declaration.unit && (
          <span style={{ color: 'var(--color-text-muted)' }}>{declaration.unit}</span>
        )}
      </div>
    </WidgetCard>
  );
}

export function NumberWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<NumberWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <label>
        Title
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
    </div>
  );
}

export const numberWidgetDemo: WidgetDemo<NumberWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-number',
    k: 'number',
    title: 'Setpoint',
    min: 0,
    max: 40,
    val: 21,
  },
  generate: () => ({}),
};
