import { useRef, useState, type ChangeEvent, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { SliderWidget as SliderWidgetDeclaration } from '../../protocol/generated/index.js';

// SPEC.md §3.6 rule 7: continuous controls send at most 20 commands/s while dragging.
const THROTTLE_MS = 50;

/** SPEC.md §4.3 `slider`: `id` doubles as the state channel (PRT-13). Live-drags send throttled
 * updates (merged with any still-pending one by DeviceSession, so this widget never needs to
 * worry about outrunning an unacknowledged request); releasing always sends the final value. */
export function SliderWidgetComponent({
  declaration,
  channelStore,
  session,
}: WidgetComponentProps<SliderWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const series = useChannelSeries(channelStore, declaration.id);
  const latest = series[series.length - 1]?.v;
  const confirmed = typeof latest === 'number' ? latest : declaration.min;
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const [dragValue, setDragValue] = useState<number | undefined>(undefined);
  const lastSentAt = useRef(0);

  const displayValue =
    dragValue ?? (controlState.status === 'pending' ? Number(controlState.value) : confirmed);

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value);
    setDragValue(next);
    if (declaration.confirm) return; // confirmed once on release instead of live (see below)
    const now = Date.now();
    if (now - lastSentAt.current >= THROTTLE_MS) {
      lastSentAt.current = now;
      session.sendControl(declaration.id, next);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value);
    setDragValue(undefined);
    if (declaration.confirm && !window.confirm(declaration.confirm)) return;
    lastSentAt.current = Date.now();
    session.sendControl(declaration.id, next); // always sent on release, throttle or not
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
        style={{
          display: 'flex',
          flexDirection: declaration.vert ? 'column' : 'row',
          alignItems: 'center',
          gap: 8,
          height: '100%',
        }}
        title={errorMessage}
      >
        <input
          type="range"
          min={declaration.min}
          max={declaration.max}
          step={declaration.step ?? 1}
          value={displayValue}
          disabled={disabled}
          onInput={handleInput}
          onChange={handleChange}
          style={
            declaration.vert
              ? { writingMode: 'vertical-lr' as const, direction: 'rtl', height: '100%' }
              : { width: '100%' }
          }
        />
        <span>
          {displayValue}
          {declaration.unit ? ` ${declaration.unit}` : ''}
        </span>
      </div>
    </WidgetCard>
  );
}

export function SliderWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<SliderWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="slider">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const sliderWidgetDemo: WidgetDemo<SliderWidgetDeclaration> = {
  declaration: { t: 'w', id: 'demo-slider', k: 'slider', title: 'Power', min: 0, max: 255, val: 0 },
  generate: () => ({}),
};
