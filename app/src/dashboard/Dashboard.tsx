import { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from './Grid';
import { getDeviceProfileKey } from './deviceKey';
import { useSessionVersion } from '../widgets/common';
import type { DeviceSession } from '../session/DeviceSession';

const DEFAULT_GROUP = 'Principale'; // SPEC.md §4: `grp` default

interface Props {
  session: DeviceSession;
  port: SerialPort | null;
}

/** APP-DSH-01: groups become tabs; only the active tab's grid is mounted, which is also what
 * gives APP-DAT-02 "only visible widgets render" for free (unmounted tabs unsubscribe). */
export function Dashboard({ session, port }: Props): JSX.Element {
  const { t } = useTranslation();
  useSessionVersion(session);

  const deviceKey = getDeviceProfileKey(port, session.getDeviceInfo()?.name);
  const widgetEntries = [...session.getWidgets().entries()];
  // widgetEntries is a fresh array on every render (getWidgets() snapshots a Map), so useMemo
  // keys off its derived content instead — these two strings change only when the widget set or
  // group assignment actually changes.
  const widgetIdsKey = widgetEntries.map(([id]) => id).join(',');
  const widgetGroupsKey = widgetEntries.map(([, e]) => e.declaration.grp).join(',');

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const [, entry] of widgetEntries) set.add(entry.declaration.grp ?? DEFAULT_GROUP);
    const list = [...set];
    list.sort((a, b) => (a === DEFAULT_GROUP ? -1 : b === DEFAULT_GROUP ? 1 : a.localeCompare(b)));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by widgetIdsKey/widgetGroupsKey, not widgetEntries itself (see comment above).
  }, [widgetIdsKey, widgetGroupsKey]);

  const [requestedGroup, setRequestedGroup] = useState<string | undefined>(undefined);
  const activeGroup =
    requestedGroup && groups.includes(requestedGroup)
      ? requestedGroup
      : (groups[0] ?? DEFAULT_GROUP);

  const activeWidgets = widgetEntries.filter(
    ([, entry]) => (entry.declaration.grp ?? DEFAULT_GROUP) === activeGroup,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {groups.length > 1 && (
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 4,
            padding: '4px 8px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === activeGroup}
              onClick={() => setRequestedGroup(g)}
              style={{ fontWeight: g === activeGroup ? 700 : 400 }}
            >
              {g}
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 8 }}>
        {activeWidgets.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.empty')}</p>
        ) : (
          <Grid
            deviceKey={deviceKey}
            group={activeGroup}
            widgets={activeWidgets}
            session={session}
          />
        )}
      </div>
    </div>
  );
}
