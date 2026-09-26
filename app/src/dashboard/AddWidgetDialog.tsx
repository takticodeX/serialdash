import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { listWidgetDescriptors } from '../widgets/registry';
import { useWidgetOverridesStore } from './useWidgetOverridesStore';
import type { ChannelStore } from '../data/ChannelStore';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

interface Props {
  deviceKey: string;
  channelStore: ChannelStore;
  onClose: () => void;
}

function randomId(): string {
  return `user-${Math.random().toString(36).slice(2, 10)}`;
}

/** APP-DSH-06: lets the user add a widget from the catalog and bind it to an existing channel,
 * without any device involvement — stored as a full synthetic declaration
 * (useWidgetOverridesStore's `userWidgets`), not a device override. */
export function AddWidgetDialog({ deviceKey, channelStore, onClose }: Props): JSX.Element {
  const { t } = useTranslation();
  const addUserWidget = useWidgetOverridesStore((s) => s.addUserWidget);
  const descriptors = listWidgetDescriptors();
  const [kind, setKind] = useState(descriptors[0]?.kind ?? '');
  const channels = channelStore.channelIds();
  const [channel, setChannel] = useState(channels[0] ?? '');

  const handleAdd = (): void => {
    if (!kind) return;
    const id = randomId();
    const declaration = {
      t: 'w',
      id,
      k: kind,
      ...(channel ? { ch: channel } : {}),
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
          {t('dashboard.addWidgetDialog.channel')}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            style={{ display: 'block', marginTop: 4, width: '100%' }}
          >
            {channels.map((c) => {
              const series = channelStore.series(c);
              const last = series[series.length - 1];
              return (
                <option key={c} value={c}>
                  {c}
                  {last ? ` (${String(last.v)})` : ''}
                </option>
              );
            })}
          </select>
        </label>
      ) : (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
          {t('dashboard.addWidgetDialog.noChannels')}
        </p>
      )}

      <button type="button" onClick={handleAdd} disabled={!kind} style={{ marginTop: 20 }}>
        {t('dashboard.addWidgetDialog.add')}
      </button>
    </div>
  );
}
