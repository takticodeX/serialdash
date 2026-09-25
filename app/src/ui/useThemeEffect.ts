import { useEffect } from 'react';
import { useSettingsStore } from '../settings/useSettingsStore';

/**
 * APP-GEN-05: light / dark / automatic theme.
 *
 * "auto" is handled entirely in CSS via `prefers-color-scheme` (theme.css) — this effect only
 * sets/clears an explicit `data-theme` override on <html> so the user's choice wins over the
 * system preference, and removes it again when they pick "auto".
 */
export function useThemeEffect(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'auto') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);
}
