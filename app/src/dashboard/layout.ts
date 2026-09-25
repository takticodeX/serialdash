import type { Layout } from 'react-grid-layout';
import type { WidgetDeclaration } from '../protocol/generated/index.js';
import { getWidgetDescriptor } from '../widgets/registry';

const GRID_COLS = 12;

export interface LayoutInput {
  id: string;
  declaration: WidgetDeclaration;
  /** Insertion order — the tiebreaker when `ord` is absent or equal (APP-DSH-02). */
  arrivalIndex: number;
}

function sizeOf(declaration: WidgetDeclaration): [number, number] {
  if (declaration.size) return declaration.size;
  return getWidgetDescriptor(declaration.k)?.defaultSize ?? [4, 3];
}

/**
 * APP-DSH-02: initial placement in `ord` order (then arrival order), each widget sized from its
 * own `size` or the widget kind's default. A simple left-to-right, top-to-bottom flow into the
 * 12-column grid — react-grid-layout's own `compactType="vertical"` then closes any gaps left by
 * differently-sized neighbors.
 */
export function computeDefaultLayout(items: LayoutInput[]): Layout[] {
  const sorted = [...items].sort((a, b) => {
    const ordA = a.declaration.ord ?? Number.MAX_SAFE_INTEGER;
    const ordB = b.declaration.ord ?? Number.MAX_SAFE_INTEGER;
    if (ordA !== ordB) return ordA - ordB;
    return a.arrivalIndex - b.arrivalIndex;
  });

  let x = 0;
  let y = 0;
  let rowHeight = 0;
  const layout: Layout[] = [];

  for (const item of sorted) {
    const [w, h] = sizeOf(item.declaration);
    if (x + w > GRID_COLS) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    layout.push({ i: item.id, x, y, w, h });
    x += w;
    rowHeight = Math.max(rowHeight, h);
  }

  return layout;
}

/** Merges a persisted layout with the current widget set: keeps saved positions for widgets that
 * still exist, and default-places any new ones the user hasn't seen yet. */
export function mergeLayout(items: LayoutInput[], saved: Layout[] | undefined): Layout[] {
  if (!saved || saved.length === 0) return computeDefaultLayout(items);

  const savedById = new Map(saved.map((l) => [l.i, l]));
  const knownIds = new Set(items.map((it) => it.id));
  const kept = saved.filter((l) => knownIds.has(l.i));

  const newItems = items.filter((it) => !savedById.has(it.id));
  if (newItems.length === 0) return kept;

  const maxY = kept.reduce((max, l) => Math.max(max, l.y + l.h), 0);
  const appended = computeDefaultLayout(newItems).map((l) => ({ ...l, y: l.y + maxY }));
  return [...kept, ...appended];
}
