import { create } from 'zustand';
import { kvGet, kvSet } from '../storage/db';
import { useSettingsStore } from '../settings/useSettingsStore';
import type { ParsedLine } from '../protocol/Parser';

export type ConsoleDirection = 'rx' | 'tx';
export type EndOfLine = 'none' | 'lf' | 'cr' | 'crlf';

export interface ConsoleLine {
  id: number;
  ts: number;
  dir: ConsoleDirection;
  raw: Uint8Array;
  text: string;
  truncated: boolean;
  kind: ParsedLine['kind'];
  /** Present only when kind === 'protocolError' (PRT-04). */
  reason: string | undefined;
}

const MAX_SEND_HISTORY = 50;

interface ConsoleState {
  lines: ConsoleLine[];
  paused: boolean;
  pendingWhilePaused: number;
  showTimestamps: boolean;
  wrap: boolean;
  hexView: boolean;
  search: string;
  eol: EndOfLine;
  sendHistory: string[];
  /** APP-CSL-04: show `@{...}` lines (dimmed) instead of hiding them. */
  showProtocolLines: boolean;
  /** APP-CSL-04: show only protocol errors — also toggled from the status bar's error count. */
  errorsOnly: boolean;

  addLine: (dir: ConsoleDirection, parsed: ParsedLine) => void;
  clear: () => void;
  setPaused: (paused: boolean) => void;
  toggleTimestamps: () => void;
  toggleWrap: () => void;
  toggleHexView: () => void;
  setSearch: (query: string) => void;
  setEol: (eol: EndOfLine) => void;
  toggleShowProtocolLines: () => void;
  setErrorsOnly: (value: boolean) => void;
  pushSendHistory: (line: string) => void;
  loadSendHistory: () => Promise<void>;
}

let nextId = 1;

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  lines: [],
  paused: false,
  pendingWhilePaused: 0,
  showTimestamps: false,
  wrap: false,
  hexView: false,
  search: '',
  eol: 'lf',
  sendHistory: [],
  showProtocolLines: false,
  errorsOnly: false,

  addLine: (dir, parsed) => {
    const line: ConsoleLine = {
      id: nextId++,
      ts: Date.now(),
      dir,
      raw: parsed.raw,
      text: parsed.text,
      truncated: parsed.truncated,
      kind: parsed.kind,
      reason: parsed.kind === 'protocolError' ? parsed.reason : undefined,
    };
    const limit = useSettingsStore.getState().consoleLineLimit;
    set((state) => {
      const lines = [...state.lines, line];
      if (lines.length > limit) lines.splice(0, lines.length - limit);
      return {
        lines,
        pendingWhilePaused: state.paused ? state.pendingWhilePaused + 1 : 0,
      };
    });
  },

  clear: () => set({ lines: [], pendingWhilePaused: 0 }),

  setPaused: (paused) => set({ paused, pendingWhilePaused: paused ? get().pendingWhilePaused : 0 }),

  toggleTimestamps: () => set((s) => ({ showTimestamps: !s.showTimestamps })),
  toggleWrap: () => set((s) => ({ wrap: !s.wrap })),
  toggleHexView: () => set((s) => ({ hexView: !s.hexView })),
  setSearch: (search) => set({ search }),
  setEol: (eol) => set({ eol }),
  toggleShowProtocolLines: () => set((s) => ({ showProtocolLines: !s.showProtocolLines })),
  setErrorsOnly: (errorsOnly) => set({ errorsOnly }),

  pushSendHistory: (line) => {
    if (!line) return;
    const next = [line, ...get().sendHistory.filter((l) => l !== line)].slice(0, MAX_SEND_HISTORY);
    set({ sendHistory: next });
    void kvSet('sendHistory', next);
  },

  loadSendHistory: async () => {
    const stored = await kvGet<string[]>('sendHistory');
    if (stored) set({ sendHistory: stored });
  },
}));

export function encodeEol(eol: EndOfLine): string {
  switch (eol) {
    case 'none':
      return '';
    case 'lf':
      return '\n';
    case 'cr':
      return '\r';
    case 'crlf':
      return '\r\n';
  }
}
