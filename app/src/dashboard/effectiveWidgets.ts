import type { DeviceSession } from '../session/DeviceSession';
import type { WidgetDeclaration } from '../protocol/generated/index.js';
import { useSessionVersion } from '../widgets/common';
import { useWidgetOverridesStore } from './useWidgetOverridesStore';

export interface EffectiveWidgetEntry {
  /** The declaration to actually render: device declaration with the user's override patch
   * applied on top (or the full synthetic declaration, for a user-created widget). */
  declaration: WidgetDeclaration;
  orphan: boolean;
  hasOverride: boolean;
  isUserCreated: boolean;
  /** The device's own declaration, before any override — undefined for a user-created widget,
   * which has none. Needed to know what "reset to device value" reverts to. */
  deviceDeclaration: WidgetDeclaration | undefined;
}

const EMPTY_OVERRIDES = {};
const EMPTY_USER_WIDGETS = {};

/** APP-DSH-04/06: the widget map a dashboard actually renders — device declarations
 * (`session.getWidgets()`) with any stored override patch merged on top (precedence: override >
 * device > each widget component's own built-in defaults for anything neither one sets), plus
 * fully user-created widgets appended. Recomputed on every render rather than memoized: cheap (a
 * handful of widgets, plain object spreads) and it sidesteps a real staleness trap — `session`'s
 * notify() fires on every `d` message too, so memoizing against "the session changed" would
 * recompute on every incoming data point regardless. */
export function useEffectiveWidgets(
  session: DeviceSession,
  deviceKey: string,
): Map<string, EffectiveWidgetEntry> {
  useSessionVersion(session);
  const overridesByWidget = useWidgetOverridesStore(
    (s) => s.profiles[deviceKey]?.overrides ?? EMPTY_OVERRIDES,
  );
  const userWidgetsByWidget = useWidgetOverridesStore(
    (s) => s.profiles[deviceKey]?.userWidgets ?? EMPTY_USER_WIDGETS,
  );

  const result = new Map<string, EffectiveWidgetEntry>();
  for (const [id, entry] of session.getWidgets()) {
    const patch = (overridesByWidget as Record<string, Partial<WidgetDeclaration>>)[id];
    const declaration = patch
      ? ({ ...entry.declaration, ...patch } as WidgetDeclaration)
      : entry.declaration;
    result.set(id, {
      declaration,
      orphan: entry.orphan,
      hasOverride: Boolean(patch),
      isUserCreated: false,
      deviceDeclaration: entry.declaration,
    });
  }
  for (const decl of Object.values(userWidgetsByWidget) as WidgetDeclaration[]) {
    result.set(decl.id, {
      declaration: decl,
      orphan: false,
      hasOverride: false,
      isUserCreated: true,
      deviceDeclaration: undefined,
    });
  }
  return result;
}
