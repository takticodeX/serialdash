import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onTryDemo: () => void;
}

/**
 * APP-GEN-02: when navigator.serial doesn't exist, explain why and list supported browsers, but
 * still offer a path forward — the simulator.
 */
export function UnsupportedBrowser({ onTryDemo }: Props): JSX.Element {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <h1>{t('unsupported.title')}</h1>
      <p>{t('unsupported.body')}</p>
      <p>{t('unsupported.browserList')}</p>

      <h2>{t('unsupported.stillUseful')}</h2>
      <ul>
        <li>
          <button type="button" onClick={onTryDemo}>
            {t('connect.tryDemo')}
          </button>
        </li>
      </ul>
    </div>
  );
}
