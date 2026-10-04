/** Lifecycle state common to every {@link Transport} implementation. */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

/** Static, non-changing metadata about a transport, shown in the UI. */
export interface TransportInfo {
  /** Friendly label shown in the UI, e.g. a USB product name or "Simulator". */
  label: string;
}

/**
 * Abstract byte transport. Nothing above this layer (console, protocol, session) may know
 * whether it's talking to real hardware, the simulator, or a replay — this is what keeps the
 * app testable without a board plugged in (SPEC.md §2.3, ADR-001).
 */
export interface Transport {
  readonly info: TransportInfo;
  readonly state: ConnectionState;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  write(data: Uint8Array): Promise<void>;

  onData(listener: (chunk: Uint8Array) => void): () => void;
  onStateChange(listener: (state: ConnectionState) => void): () => void;
  /** Fires when the transport was disconnected unexpectedly (cable pulled, device reset). */
  onDisconnect(listener: (reason: 'user' | 'device' | 'error') => void): () => void;
}
