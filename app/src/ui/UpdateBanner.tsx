import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** APP-GEN-03: "New version available — reload" banner, never applied without asking during an
 * active session. */
export function UpdateBanner(): JSX.Element | null {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        background: 'var(--color-accent)',
        color: 'var(--color-accent-contrast)',
      }}
    >
      <span>{t('pwa.updateAvailable')}</span>
      <button type="button" onClick={() => void updateServiceWorker(true)}>
        {t('pwa.reload')}
      </button>
    </div>
  );
}
