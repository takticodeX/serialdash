import { describe, expect, it } from 'vitest';
import { computeDefaultLayout, mergeLayout, type LayoutInput } from './layout';
import { registerBuiltinWidgets } from '../widgets/index';
import type { LineWidget, ValueWidget } from '../protocol/generated/index.js';

registerBuiltinWidgets();

function item(
  id: string,
  declaration: Partial<LineWidget | ValueWidget> & { k: string },
  arrivalIndex: number,
): LayoutInput {
  return { id, declaration: { t: 'w', id, ...declaration } as never, arrivalIndex };
}

describe('APP-DSH-02 computeDefaultLayout', () => {
  it('orders by ord, then arrival, wrapping at 12 columns', () => {
    // value defaults to [3,2]: four fit exactly on one row of 12.
    const items = [
      item('a', { k: 'value' }, 0),
      item('b', { k: 'value' }, 1),
      item('c', { k: 'value' }, 2),
      item('d', { k: 'value' }, 3),
      item('e', { k: 'value' }, 4),
    ];
    const layout = computeDefaultLayout(items);
    expect(layout.map((l) => [l.i, l.x, l.y])).toEqual([
      ['a', 0, 0],
      ['b', 3, 0],
      ['c', 6, 0],
      ['d', 9, 0],
      ['e', 0, 2], // wraps: row height was 2
    ]);
  });

  it('respects explicit ord over arrival order', () => {
    const items = [
      item('first-arrived', { k: 'value', ord: 2 }, 0),
      item('second-arrived', { k: 'value', ord: 1 }, 1),
    ];
    const layout = computeDefaultLayout(items);
    expect(layout.map((l) => l.i)).toEqual(['second-arrived', 'first-arrived']);
  });

  it('uses a declared size over the widget kind default', () => {
    const items = [item('a', { k: 'value', size: [6, 5] }, 0)];
    const layout = computeDefaultLayout(items);
    expect(layout[0]).toMatchObject({ w: 6, h: 5 });
  });

  it('falls back to the widget kind default size when none is declared', () => {
    const items = [item('a', { k: 'line' }, 0)];
    const layout = computeDefaultLayout(items);
    expect(layout[0]).toMatchObject({ w: 6, h: 4 });
  });
});

describe('mergeLayout', () => {
  it('keeps saved positions for widgets that still exist', () => {
    const items = [item('a', { k: 'value' }, 0)];
    const saved = [{ i: 'a', x: 7, y: 3, w: 3, h: 2 }];
    expect(mergeLayout(items, saved)).toEqual(saved);
  });

  it('drops saved entries for widgets that no longer exist', () => {
    const items = [item('a', { k: 'value' }, 0)];
    const saved = [
      { i: 'a', x: 0, y: 0, w: 3, h: 2 },
      { i: 'gone', x: 3, y: 0, w: 3, h: 2 },
    ];
    expect(mergeLayout(items, saved).map((l) => l.i)).toEqual(['a']);
  });

  it('appends new widgets below the saved layout instead of overlapping it', () => {
    const items = [item('a', { k: 'value' }, 0), item('b', { k: 'value' }, 1)];
    const saved = [{ i: 'a', x: 0, y: 0, w: 3, h: 2 }];
    const merged = mergeLayout(items, saved);
    expect(merged.find((l) => l.i === 'a')).toEqual(saved[0]);
    const bLayout = merged.find((l) => l.i === 'b');
    expect(bLayout?.y).toBeGreaterThanOrEqual(2); // below the saved item, not overlapping it
  });

  it('falls back to the default layout when nothing is saved', () => {
    const items = [item('a', { k: 'value' }, 0)];
    expect(mergeLayout(items, undefined)).toEqual(computeDefaultLayout(items));
  });
});
