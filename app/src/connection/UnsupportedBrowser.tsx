import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * APP-GEN-02: when navigator.serial doesn't exist, explain why and list supported browsers, but
 * still offer a path forward. The simulator (M2) and replay (M6) don't exist yet, so those links
 * are shown as disabled/"coming soon" for now rather than broken — they'll become real links once
 * those milestones land.
 */
export function UnsupportedBrowser(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <h1>{t('unsupported.title')}</h1>
      <p>{t('unsupported.body')}</p>
      <p>{t('unsupported.browserList')}</p>

      <h2>{t('unsupported.stillUseful')}</h2>
      <ul>
        <li>
          <button type="button" disabled title={t('unsupported.simulatorComingSoon')}>
            {t('unsupported.simulatorComingSoon')}
          </button>
        </li>
        <li>
          <button type="button" disabled title={t('unsupported.replayComingSoon')}>
            {t('unsupported.replayComingSoon')}
          </button>
        </li>
      </ul>
    </div>
  );
}
