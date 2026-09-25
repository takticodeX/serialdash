import type { ComponentType } from 'react';
import type { WidgetDeclaration } from '../protocol/generated/index.js';
import type { ChannelStore, ChannelValue } from '../data/ChannelStore';
import type { DeviceSession } from '../session/DeviceSession';

export interface WidgetComponentProps<TDeclaration extends WidgetDeclaration = WidgetDeclaration> {
  declaration: TDeclaration;
  channelStore: ChannelStore;
  session: DeviceSession;
}

export interface WidgetConfigPanelProps<
  TDeclaration extends WidgetDeclaration = WidgetDeclaration,
> {
  declaration: TDeclaration;
  onChange: (patch: Partial<TDeclaration>) => void;
}

/**
 * A widget's demo example (SPEC.md §4, DOC-01): the declaration the simulator/docs/e2e tests use,
 * and a pure function that produces one `d` message's worth of channel values for a given tick —
 * driven by the simulator's own clock, not a timer the widget owns.
 */
export interface WidgetDemo<TDeclaration extends WidgetDeclaration = WidgetDeclaration> {
  declaration: TDeclaration;
  generate: (tickMs: number) => Record<string, ChannelValue>;
}

export interface WidgetDescriptor<TDeclaration extends WidgetDeclaration = WidgetDeclaration> {
  kind: TDeclaration['k'];
  /** i18n key under `widgets.<kind>.name` / `.description` — no literal strings here (APP-GEN-04). */
  nameKey: string;
  descriptionKey: string;
  icon: string;
  /** [w, h] in grid cells, used when a `w` declaration has no `size` (APP-DSH-02). */
  defaultSize: [number, number];
  Component: ComponentType<WidgetComponentProps<TDeclaration>>;
  ConfigPanel: ComponentType<WidgetConfigPanelProps<TDeclaration>>;
  demo: WidgetDemo<TDeclaration>;
}

// Stored type-erased to the full WidgetDeclaration union: registerWidget below is the one place
// that knows the precise TDeclaration a given descriptor was built for, and callers looking a
// widget up by `kind` at runtime (Grid.tsx) only ever have a plain WidgetDeclaration in hand
// anyway — correctness rests on `descriptor.kind === declaration.k`, checked by construction.
const registry = new Map<string, WidgetDescriptor<WidgetDeclaration>>();

export function registerWidget<TDeclaration extends WidgetDeclaration>(
  descriptor: WidgetDescriptor<TDeclaration>,
): void {
  registry.set(descriptor.kind, descriptor as unknown as WidgetDescriptor<WidgetDeclaration>);
}

export function getWidgetDescriptor(kind: string): WidgetDescriptor<WidgetDeclaration> | undefined {
  return registry.get(kind);
}

export function listWidgetDescriptors(): WidgetDescriptor<WidgetDeclaration>[] {
  return [...registry.values()];
}
