import { useEffect, useState } from 'react';
import { useConnectionStore } from '../serial/useConnectionStore';
import type { DeviceSession } from './DeviceSession';

/** Re-renders the caller whenever the active DeviceSession's state changes (handshake status,
 * device info, widgets, events) — handshake/widget events are infrequent, unlike ChannelStore's
 * data stream, so no rAF batching is needed here (compare `useChannelSeries`).
 *
 * Returns null when nothing has connected yet. The session (and its last-known widgets/device
 * info) deliberately survives a disconnect — SPEC.md §3.5 rule 6 keeps widgets visible with a
 * "disconnected" state rather than clearing the dashboard. */
export function useDeviceSession(): DeviceSession | null {
  const session = useConnectionStore((s) => s.session);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!session) return;
    return session.subscribe(() => forceRender((n) => n + 1));
  }, [session]);

  return session;
}
