import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useConsoleStore } from './useConsoleStore';
import { downloadTextFile } from '../ui/downloadTextFile';

/** APP-CSL-03 (timestamps, wrap), APP-CSL-04 (search), APP-CSL-08 (hex), APP-CSL-09 (clear/copy/save). */
export function ConsoleToolbar(): JSX.Element {
  const { t } = useTranslation();
  const showTimestamps = useConsoleStore((s) => s.showTimestamps);
  const wrap = useConsoleStore((s) => s.wrap);
  const hexView = useConsoleStore((s) => s.hexView);
  const search = useConsoleStore((s) => s.search);
  const toggleTimestamps = useConsoleStore((s) => s.toggleTimestamps);
  const toggleWrap = useConsoleStore((s) => s.toggleWrap);
  const toggleHexView = useConsoleStore((s) => s.toggleHexView);
  const setSearch = useConsoleStore((s) => s.setSearch);
  const clear = useConsoleStore((s) => s.clear);
  const lines = useConsoleStore((s) => s.lines);
  const showProtocolLines = useConsoleStore((s) => s.showProtocolLines);
  const toggleShowProtocolLines = useConsoleStore((s) => s.toggleShowProtocolLines);
  const errorsOnly = useConsoleStore((s) => s.errorsOnly);
  const setErrorsOnly = useConsoleStore((s) => s.setErrorsOnly);

  const allText = (): string => lines.map((l) => l.text).join('\n');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 8px',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('console.search')}
        aria-label={t('console.search')}
        style={{
          flex: '1 1 160px',
          minWidth: 120,
          padding: '4px 8px',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      />

      <label>
        <input type="checkbox" checked={showTimestamps} onChange={toggleTimestamps} />{' '}
        {t('console.timestamps')}
      </label>
      <label>
        <input type="checkbox" checked={wrap} onChange={toggleWrap} /> {t('console.wrap')}
      </label>
      <label>
        <input type="checkbox" checked={hexView} onChange={toggleHexView} /> {t('console.hexView')}
      </label>
      <label>
        <input type="checkbox" checked={showProtocolLines} onChange={toggleShowProtocolLines} />{' '}
        {t('console.showProtocolLines')}
      </label>
      <label>
        <input
          type="checkbox"
          checked={errorsOnly}
          onChange={(e) => setErrorsOnly(e.target.checked)}
        />{' '}
        {t('console.errorsOnly')}
      </label>

      <button type="button" onClick={clear}>
        {t('console.clear')}
      </button>
      <button type="button" onClick={() => void navigator.clipboard.writeText(allText())}>
        {t('console.copyAll')}
      </button>
      <button type="button" onClick={() => downloadTextFile('serialdash-console.txt', allText())}>
        {t('console.saveAsTxt')}
      </button>
    </div>
  );
}
