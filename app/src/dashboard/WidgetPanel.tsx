import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getWidgetDescriptor } from '../widgets/registry';
import { useWidgetOverridesStore } from './useWidgetOverridesStore';
import { compatibleKinds } from './templateCompatibility';
import type { EffectiveWidgetEntry } from './effectiveWidgets';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

interface Props {
  deviceKey: string;
  widgetId: string;
  entry: EffectiveWidgetEntry;
  onClose: () => void;
}

/** APP-DSH-04/05/06: the per-widget config side panel — mounts the widget kind's own
 * `ConfigPanel` (built since M2, never wired to any UI until now), a "change type" picker for
 * value-compatible kinds, and "reset to device value" (whole-widget, not per-property: with each
 * `ConfigPanel` today exposing only a couple of fields, a per-field revert control would be more
 * UI than the fields it's next to — worth revisiting once config panels grow). User-created
 * widgets show a delete action instead, since they have no device declaration to revert to. */
export function WidgetPanel({ deviceKey, widgetId, entry, onClose }: Props): JSX.Element {
  const { t } = useTranslation();
  const setOverride = useWidgetOverridesStore((s) => s.setOverride);
  const clearOverride = useWidgetOverridesStore((s) => s.clearOverride);
  const updateUserWidget = useWidgetOverridesStore((s) => s.updateUserWidget);
  const removeUserWidget = useWidgetOverridesStore((s) => s.removeUserWidget);

  const descriptor = getWidgetDescriptor(entry.declaration.k);
  const kinds = compatibleKinds(entry.declaration.k);

  const applyPatch = (patch: Partial<WidgetDeclaration>): void => {
    if (entry.isUserCreated) updateUserWidget(deviceKey, widgetId, patch);
    else setOverride(deviceKey, widgetId, patch);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('dashboard.panel.title')}
      className="panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '100%',
        padding: 20,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{t('dashboard.panel.title')}</h2>
        <button type="button" onClick={onClose} aria-label={t('common.close')}>
          ✕
        </button>
      </div>

      {kinds.length > 0 && (
        <label style={{ display: 'block', marginTop: 16 }}>
          {t('dashboard.panel.widgetType')}
          <select
            value={entry.declaration.k}
            onChange={(e) => applyPatch({ k: e.target.value } as Partial<WidgetDeclaration>)}
            style={{ display: 'block', marginTop: 4, width: '100%' }}
          >
            <option value={entry.declaration.k}>{entry.declaration.k}</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      )}

      {descriptor && (
        <div style={{ marginTop: 16 }}>
          <descriptor.ConfigPanel declaration={entry.declaration} onChange={applyPatch} />
        </div>
      )}

      {entry.isUserCreated ? (
        <button
          type="button"
          onClick={() => {
            removeUserWidget(deviceKey, widgetId);
            onClose();
          }}
          style={{ marginTop: 24, color: 'var(--color-danger)' }}
        >
          {t('dashboard.panel.deleteWidget')}
        </button>
      ) : (
        entry.hasOverride && (
          <button
            type="button"
            onClick={() => clearOverride(deviceKey, widgetId)}
            style={{ marginTop: 24 }}
          >
            {t('dashboard.panel.resetToDevice')}
          </button>
        )
      )}
    </div>
  );
}
