import type { ChannelStore } from '../data/ChannelStore';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

export function widgetChannels(declaration: WidgetDeclaration): string[] {
  const ch = (declaration as { ch?: string | [string, ...string[]] }).ch;
  if (!ch) return [declaration.id]; // controls: id doubles as the channel (PRT-13)
  return Array.isArray(ch) ? ch : [ch];
}

function csvCell(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** APP-DSH-07: exports one widget's channel data as CSV. Channels aren't necessarily sampled at
 * the same instants (each has its own independently-timestamped ring buffer), so rather than
 * force a join, this emits one row per (channel, sample) pair sorted by time — always correct
 * regardless of channel count, at the cost of a "channel" column instead of one column each. */
export function widgetSeriesToCsv(
  channelStore: ChannelStore,
  declaration: WidgetDeclaration,
): string {
  const rows: { t: number; channel: string; value: unknown }[] = [];
  for (const channel of widgetChannels(declaration)) {
    for (const point of channelStore.series(channel)) {
      rows.push({ t: point.t, channel, value: point.v });
    }
  }
  rows.sort((a, b) => a.t - b.t);

  const lines = ['timestamp_ms,iso_time,channel,value'];
  for (const row of rows) {
    lines.push(
      [
        csvCell(row.t),
        csvCell(new Date(row.t).toISOString()),
        csvCell(row.channel),
        csvCell(row.value),
      ].join(','),
    );
  }
  return lines.join('\n');
}
