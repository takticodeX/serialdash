import { useEffect, useState, type CSSProperties, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourStore, TOUR_STEP_COUNT } from './useTourStore';

interface TourStep {
  titleKey: string;
  bodyKey: string;
  /** Matches a `data-tour` attribute elsewhere in the app. Omitted for the welcome step, which
   * has nothing to point at yet. When the element isn't currently in the DOM (e.g. the step
   * targets the dashboard's "Add widget" button but the tour is replayed from the connect
   * screen), the step still shows — just centered, with no spotlight — rather than getting stuck. */
  target?: string;
}

const STEPS: TourStep[] = [
  { titleKey: 'tour.step1Title', bodyKey: 'tour.step1Body' },
  { titleKey: 'tour.step2Title', bodyKey: 'tour.step2Body', target: 'connect-simulator' },
  { titleKey: 'tour.step3Title', bodyKey: 'tour.step3Body', target: 'add-widget' },
  { titleKey: 'tour.step4Title', bodyKey: 'tour.step4Body', target: 'open-help' },
];

const TOOLTIP_WIDTH = 280;
const TOOLTIP_MARGIN = 12;

function tooltipPosition(rect: DOMRect | undefined): CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
  const left = Math.min(
    Math.max(TOOLTIP_MARGIN, rect.left),
    window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN,
  );
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow > 180) return { top: rect.bottom + TOOLTIP_MARGIN, left };
  return { top: Math.max(TOOLTIP_MARGIN, rect.top - 180), left };
}

/** DOC-32: the first-run tour overlay. Highlights its current step's target (if present in the
 * DOM right now) with a CSS spotlight — a single absolutely-positioned box whose oversized
 * `box-shadow` dims everything else, rather than a canvas/clip-path cutout — and floats a small
 * tooltip with Back/Next/Skip next to it. */
export function TourOverlay(): JSX.Element | null {
  const { t } = useTranslation();
  const active = useTourStore((s) => s.active);
  const step = useTourStore((s) => s.step);
  const next = useTourStore((s) => s.next);
  const prev = useTourStore((s) => s.prev);
  const stop = useTourStore((s) => s.stop);

  const current = STEPS[step];
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  useEffect(() => {
    if (!active || !current) {
      setRect(undefined);
      return;
    }
    const el = current.target ? document.querySelector(`[data-tour="${current.target}"]`) : null;
    const update = (): void => setRect(el?.getBoundingClientRect());
    if (el) {
      // A target below the fold (e.g. the simulator button, scrolled past on a short viewport)
      // would otherwise get a spotlight "hole" positioned off-screen — invisible, since the
      // box-shadow trick only dims the viewport around wherever the hole element actually sits.
      // block: 'center' instead of 'nearest' so the tooltip (positioned relative to the target)
      // has room to lay out below or above it either way.
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active, current]);

  if (!active || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('tour.title')}
      style={{ position: 'fixed', inset: 0, zIndex: 50 }}
    >
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'none',
            transition: 'top 150ms, left 150ms, width 150ms, height 150ms',
          }}
        />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)' }} />
      )}

      <div
        className="panel"
        style={{
          position: 'fixed',
          ...tooltipPosition(rect),
          width: TOOLTIP_WIDTH,
          padding: 16,
          zIndex: 51,
        }}
      >
        <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{t(current.titleKey)}</p>
        <p style={{ margin: '0 0 12px', color: 'var(--color-text-muted)' }}>{t(current.bodyKey)}</p>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
        >
          <button type="button" onClick={stop}>
            {t('tour.skip')}
          </button>
          <span style={{ fontSize: '0.8em', color: 'var(--color-text-muted)' }}>
            {step + 1} / {TOUR_STEP_COUNT}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button type="button" onClick={prev}>
                {t('tour.back')}
              </button>
            )}
            <button type="button" onClick={next}>
              {step === TOUR_STEP_COUNT - 1 ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
