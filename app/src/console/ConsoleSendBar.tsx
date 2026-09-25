import { useState, type JSX, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useConsoleStore, type EndOfLine } from './useConsoleStore';

const EOL_OPTIONS: EndOfLine[] = ['lf', 'crlf', 'cr', 'none'];

interface Props {
  disabled: boolean;
  onSend: (text: string) => void;
}

/** APP-CSL-07: send field with end-of-line choice and ↑/↓ history (last 50, persisted). */
export function ConsoleSendBar({ disabled, onSend }: Props): JSX.Element {
  const { t } = useTranslation();
  const eol = useConsoleStore((s) => s.eol);
  const setEol = useConsoleStore((s) => s.setEol);
  const sendHistory = useConsoleStore((s) => s.sendHistory);
  const pushSendHistory = useConsoleStore((s) => s.pushSendHistory);

  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  const submit = (): void => {
    if (!value) return;
    onSend(value);
    pushSendHistory(value);
    setValue('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      if (sendHistory.length === 0) return;
      e.preventDefault();
      const next = Math.min(historyIndex + 1, sendHistory.length - 1);
      setHistoryIndex(next);
      setValue(sendHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setValue(next >= 0 ? (sendHistory[next] ?? '') : '');
    }
  };

  return (
    <div
      style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid var(--color-border)' }}
    >
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('console.sendPlaceholder')}
        aria-label={t('console.sendPlaceholder')}
        style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          padding: '6px 8px',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      />
      <label className="visually-hidden" htmlFor="console-eol">
        {t('console.eol')}
      </label>
      <select
        id="console-eol"
        value={eol}
        onChange={(e) => setEol(e.target.value as EndOfLine)}
        aria-label={t('console.eol')}
      >
        {EOL_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {t(`console.eol_${opt}`)}
          </option>
        ))}
      </select>
      <button type="button" onClick={submit} disabled={disabled || !value}>
        {t('console.send')}
      </button>
    </div>
  );
}
