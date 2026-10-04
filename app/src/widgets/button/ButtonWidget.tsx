import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import { ConfigField, WidgetCard, useConnected, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { ButtonWidget as ButtonWidgetDeclaration } from '../../protocol/generated/index.js';

/** SPEC.md §4.3 `button`: `id` is the state channel (PRT-13) — `ch` is unused. Sends `true` on
 * click, or `true`/`false` on press/release when `hold` is set. */
export function ButtonWidgetComponent({
  declaration,
  session,
}: WidgetComponentProps<ButtonWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const connected = useConnected();
  const controlState = session.getControlState(declaration.id);
  const disabled = declaration.dis === true || !connected;

  const send = (value: boolean): void => {
    if (disabled) return;
    if (declaration.confirm && value && !window.confirm(declaration.confirm)) return;
    session.sendControl(declaration.id, value);
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        title={errorMessage}
      >
        {declaration.hold ? (
          <button
            type="button"
            disabled={disabled}
            style={{ background: declaration.color, width: '100%', height: '100%' }}
            onPointerDown={() => send(true)}
            onPointerUp={() => send(false)}
            onPointerLeave={() => send(false)}
          >
            {declaration.label ?? widgetTitle(declaration)}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            style={{ background: declaration.color, width: '100%', height: '100%' }}
            onClick={() => send(true)}
          >
            {declaration.label ?? widgetTitle(declaration)}
          </button>
        )}
      </div>
    </WidgetCard>
  );
}

export function ButtonWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<ButtonWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="button">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
      <ConfigField label="Label" kind="button" prop="label">
        <input
          type="text"
          value={declaration.label ?? ''}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const buttonWidgetDemo: WidgetDemo<ButtonWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-button',
    k: 'button',
    title: 'Reboot',
    confirm: 'Are you sure?',
  },
  generate: () => ({}),
};
