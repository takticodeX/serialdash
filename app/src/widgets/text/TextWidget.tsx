import { useEffect, useState, type JSX, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { TextWidget as TextWidgetDeclaration } from '../../protocol/generated/index.js';

/** SPEC.md §4.3 `text`: sent on Enter, length capped by `max` (also bounded by the device's `rx`,
 * PRT-08 — that half is enforced device-side, this is just the UI-visible limit). */
export function TextWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<TextWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const confirmed = series[series.length - 1]?.v;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const [draft, setDraft] = useState<string>('');
  useEffect(() => {
    if (controlState.status !== 'pending') {
      setDraft(typeof confirmed === 'string' ? confirmed : '');
    }
  }, [confirmed, controlState.status]);

  const commit = (): void => {
    if (disabled) return;
    if (declaration.confirm && !window.confirm(declaration.confirm)) return;
    session.sendControl(declaration.id, draft);
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
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }} title={errorMessage}>
        <input
          type="text"
          value={draft}
          maxLength={declaration.max}
          placeholder={declaration.ph}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') commit();
          }}
          style={{ width: '100%' }}
        />
      </div>
    </WidgetCard>
  );
}

export function TextWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<TextWidgetDeclaration>): JSX.Element {
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

export const textWidgetDemo: WidgetDemo<TextWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-text',
    k: 'text',
    title: 'Label',
    max: 32,
    ph: 'type here',
    val: '',
  },
  generate: () => ({}),
};
