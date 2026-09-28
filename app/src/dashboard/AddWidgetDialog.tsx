import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { isControlKind, listWidgetDescriptors } from '../widgets/registry';
import { useWidgetOverridesStore } from './useWidgetOverridesStore';
import { listNonEmptyChannelIds, type ChannelStore } from '../data/ChannelStore';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

interface Props {
  deviceKey: string;
  channelStore: ChannelStore;
  /** Ids of widgets already on the dashboard (device-declared or user-created) — used to keep a
   * new control widget from silently colliding with one that already owns that id. */
  existingWidgetIds: ReadonlySet<string>;
  onClose: () => void;
}

function randomId(): string {
  return `user-${Math.random().toString(36).slice(2, 10)}`;
}

/** APP-DSH-06: lets the user add a widget from the catalog and bind it to an existing channel,
 * without any device involvement — stored as a full synthetic declaration
 * (useWidgetOverridesStore's `userWidgets`), not a device override.
 *
 * Controls are a special case: a control's `id` *is* its channel (PRT-13, `ch` is ignored), so a
 * control widget reuses the picked channel as its own `id` instead of getting a fresh random one
 * — otherwise it can only ever send `c` for an id the device never registered (LIB-RX-07's
 * "unknown control"), no matter what channel was picked. But `id` also doubles as this app's
 * per-widget map key (effectiveWidgets.ts, DeviceSession's control-state maps), so picking an id
 * some other widget already owns would silently replace that widget's card rather than add a
 * second one — the control id picker below excludes ids with an existing widget to avoid that,
 * which does mean it only offers ids the device recognizes as controls but never built its own
 * widget for (reachable via `onAnyControl`, SPEC.md §6.5). */
export function AddWidgetDialog({
  deviceKey,
  channelStore,
  existingWidgetIds,
  onClose,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const addUserWidget = useWidgetOverridesStore((s) => s.addUserWidget);
  const descriptors = listWidgetDescriptors();
  const [kind, setKind] = useState(descriptors[0]?.kind ?? '');
  const isControl = isControlKind(kind);
  // Snapshotted once, at mount — not recomputed from live channelStore/existingWidgetIds on every
  // render. The dashboard's parent re-renders on every incoming `d` message (a few times a
  // second); recomputing this list from live data each time changed the open <select>'s options
  // out from under the user mid-pick, which browsers handle badly (the dropdown would flicker and
  // then refuse to register a choice, only closable with Esc). A channel appearing after the
  // dialog is already open just won't show up until it's reopened — a fine trade for a picker that
  // actually stays put while you use it.
  const [allChannels] = useState(() => listNonEmptyChannelIds(channelStore));
  const [existingIdsSnapshot] = useState(() => existingWidgetIds);
  const channels = isControl
    ? allChannels.filter((id) => !existingIdsSnapshot.has(id))
    : allChannels;
  const [channelPick, setChannelPick] = useState('');
  const channel = channels.includes(channelPick) ? channelPick : (channels[0] ?? '');

  const handleAdd = (): void => {
    if (!kind) return;
    if (isControl && !channel) return; // nothing to bind this control's id to
    const id = isControl ? channel : randomId();
    const declaration = {
      t: 'w',
      id,
      k: kind,
      // A control's id is already the channel name (e.g. "relay") and needs no help — but a
      // display widget's id is the random `id` above, meaningless on screen (widgetTitle() falls
      // back to it verbatim, "user-mn4h32n" and all) unless something better is set here.
      ...(!isControl && channel ? { ch: channel, title: channel } : {}),
    } as WidgetDeclaration;
    addUserWidget(deviceKey, declaration);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('dashboard.addWidgetDialog.title')}
      className="panel"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320,
        maxWidth: '90%',
        padding: 20,
        zIndex: 15,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{t('dashboard.addWidgetDialog.title')}</h2>
        <button type="button" onClick={onClose} aria-label={t('common.close')}>
          ✕
        </button>
      </div>

      <label style={{ display: 'block', marginTop: 16 }}>
        {t('dashboard.addWidgetDialog.type')}
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          style={{ display: 'block', marginTop: 4, width: '100%' }}
        >
          {descriptors.map((d) => (
            <option key={d.kind} value={d.kind}>
              {t(d.nameKey)}
            </option>
          ))}
        </select>
      </label>

      {channels.length > 0 ? (
        <label style={{ display: 'block', marginTop: 16 }}>
          {isControl
            ? t('dashboard.addWidgetDialog.controlId')
            : t('dashboard.addWidgetDialog.channel')}
          <select
            value={channel}
            onChange={(e) => setChannelPick(e.target.value)}
            style={{ display: 'block', marginTop: 4, width: '100%' }}
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {isControl && (
            <span style={{ display: 'block', fontSize: '0.8em', color: 'var(--color-text-muted)' }}>
              {t('dashboard.addWidgetDialog.controlIdHint')}
            </span>
          )}
        </label>
      ) : (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
          {isControl
            ? t('dashboard.addWidgetDialog.controlNoTargets')
            : t('dashboard.addWidgetDialog.noChannels')}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!kind || (isControl && !channel)}
        style={{ marginTop: 20 }}
      >
        {t('dashboard.addWidgetDialog.add')}
      </button>
    </div>
  );
}
