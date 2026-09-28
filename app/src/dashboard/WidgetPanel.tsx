import { Suspense, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getWidgetDescriptor, isControlKind } from '../widgets/registry';
import { useWidgetOverridesStore } from './useWidgetOverridesStore';
import { compatibleKinds } from './templateCompatibility';
import { listNonEmptyChannelIds, type ChannelStore } from '../data/ChannelStore';
import type { EffectiveWidgetEntry } from './effectiveWidgets';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

interface Props {
  deviceKey: string;
  widgetId: string;
  entry: EffectiveWidgetEntry;
  channelStore: ChannelStore;
  onClose: () => void;
}

/** APP-DSH-04/05/06: the per-widget config side panel — mounts the widget kind's own
 * `ConfigPanel` (built since M2, never wired to any UI until now), a channel picker, a "change
 * type" picker for value-compatible kinds, and "reset to device value" (whole-widget, not
 * per-property: with each `ConfigPanel` today exposing only a couple of fields, a per-field
 * revert control would be more UI than the fields it's next to — worth revisiting once config
 * panels grow). User-created widgets show a delete action instead, since they have no device
 * declaration to revert to. */
export function WidgetPanel({
  deviceKey,
  widgetId,
  entry,
  channelStore,
  onClose,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const setOverride = useWidgetOverridesStore((s) => s.setOverride);
  const clearOverride = useWidgetOverridesStore((s) => s.clearOverride);
  const updateUserWidget = useWidgetOverridesStore((s) => s.updateUserWidget);
  const removeUserWidget = useWidgetOverridesStore((s) => s.removeUserWidget);

  const descriptor = getWidgetDescriptor(entry.declaration.k);
  const kinds = compatibleKinds(entry.declaration.k);
  // Controls don't have a `ch` at all (their `id` is their channel, PRT-13) and `log` has neither
  // — nothing to rebind for either, so the channel picker below only applies to the rest.
  const showChannelPicker = !isControlKind(entry.declaration.k) && entry.declaration.k !== 'log';
  const currentCh = entry.declaration.ch;
  const channelOptions = listNonEmptyChannelIds(channelStore);

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

      {showChannelPicker && (
        <label style={{ display: 'block', marginTop: 16 }}>
          {t('dashboard.panel.channel')}
          {Array.isArray(currentCh) ? (
            <div style={{ marginTop: 4, fontSize: '0.9em', color: 'var(--color-text-muted)' }}>
              {currentCh.join(', ')}
            </div>
          ) : (
            <select
              value={currentCh ?? ''}
              onChange={(e) => applyPatch({ ch: e.target.value } as Partial<WidgetDeclaration>)}
              style={{ display: 'block', marginTop: 4, width: '100%' }}
            >
              {currentCh && !channelOptions.includes(currentCh) && (
                <option value={currentCh}>{currentCh}</option>
              )}
              {channelOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </label>
      )}

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
          {/* gauge/pie/heat's ConfigPanel is lazy-loaded along with their Component (registry.ts)
              — without this boundary, opening this panel for one of them before the chunk finishes
              loading throws (a lazy element suspending with no Suspense above it), taking down the
              whole app to a blank page instead of just this panel. */}
          <Suspense fallback={null}>
            <descriptor.ConfigPanel declaration={entry.declaration} onChange={applyPatch} />
          </Suspense>
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
