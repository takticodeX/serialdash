import type { ComponentType } from 'react';
import type { WidgetDeclaration } from '../protocol/generated/index.js';
import type { ChannelStore, ChannelValue } from '../data/ChannelStore';
import type { DeviceSession } from '../session/DeviceSession';

/** Props every widget kind's rendering component receives (see `Grid.tsx`). */
export interface WidgetComponentProps<TDeclaration extends WidgetDeclaration = WidgetDeclaration> {
  declaration: TDeclaration;
  channelStore: ChannelStore;
  session: DeviceSession;
}

/** Props every widget kind's config-panel component receives (the per-widget editor in
 * `WidgetPanel`). `onChange` merges `patch` into the live declaration — an override, not a
 * partial update sent to the device (SPEC.md's device-is-source-of-truth model). */
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

/** Everything the app needs to know about one widget kind — registered once per kind at module
 * load (see each `widgets/<kind>/index.ts`) via {@link registerWidget}, looked up by
 * {@link getWidgetDescriptor}/{@link listWidgetDescriptors}. */
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

/** Registers `descriptor` under `descriptor.kind`, overwriting any previous registration for that
 * kind. Called once per widget kind at module load. */
export function registerWidget<TDeclaration extends WidgetDeclaration>(
  descriptor: WidgetDescriptor<TDeclaration>,
): void {
  registry.set(descriptor.kind, descriptor as unknown as WidgetDescriptor<WidgetDeclaration>);
}

/** Looks up the descriptor for one `kind` string (a declaration's `k`), or `undefined` if no
 * widget kind with that name is registered (e.g. an unrecognized/future kind from the device). */
export function getWidgetDescriptor(kind: string): WidgetDescriptor<WidgetDeclaration> | undefined {
  return registry.get(kind);
}

/** All registered widget descriptors, in registration order. */
export function listWidgetDescriptors(): WidgetDescriptor<WidgetDeclaration>[] {
  return [...registry.values()];
}

// SPEC.md §4.3 `controlExtras`: a control's `id` doubles as its state channel (PRT-13), so it has
// no `ch` at all — unlike every display kind. AddWidgetDialog/WidgetPanel need to know which is
// which: a control widget's "channel" is really an existing control id it talks to, not a `ch` to
// bind, and there's no schema flag for this, so it's a static list mirroring the P0/P1 controls.
const CONTROL_KINDS = new Set(['button', 'switch', 'slider', 'number', 'select', 'text', 'color']);

/** Whether `kind` is one of the 7 control kinds (button/switch/slider/number/select/text/color) —
 * see the `CONTROL_KINDS` comment above for why this can't be derived from the schema alone. */
export function isControlKind(kind: string): boolean {
  return CONTROL_KINDS.has(kind);
}
