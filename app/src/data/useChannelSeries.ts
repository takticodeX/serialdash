import { useEffect, useRef, useState } from 'react';
import type { ChannelPoint, ChannelStore } from './ChannelStore';

/**
 * APP-DAT-02: subscribes a component to one channel's updates, but re-renders at most once per
 * animation frame (≤60 fps) rather than once per incoming point — a fast-streaming channel would
 * otherwise trigger a React re-render per sample. "Only for visible widgets" is achieved for free
 * by ordinary React unmounting: the dashboard only mounts the active tab's widgets (see
 * dashboard/Tabs.tsx), so a hidden widget simply isn't subscribed at all.
 */
export function useChannelSeries(store: ChannelStore, channelId: string): readonly ChannelPoint[] {
  const [, forceRender] = useState(0);
  const scheduled = useRef(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(channelId, () => {
      if (scheduled.current) return;
      scheduled.current = true;
      requestAnimationFrame(() => {
        scheduled.current = false;
        forceRender((n) => n + 1);
      });
    });
    return unsubscribe;
  }, [store, channelId]);

  return store.series(channelId);
}
