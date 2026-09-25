import { describe, expect, it, vi } from 'vitest';
import { WebSerialTransport, DEFAULT_CONNECTION_OPTIONS } from './webSerialTransport';

/** Minimal fake satisfying the SerialPort surface WebSerialTransport actually uses. */
function makeFakePort(): {
  port: SerialPort;
  controller: ReadableStreamDefaultController<Uint8Array>;
  written: Uint8Array[];
} {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const readable = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  const written: Uint8Array[] = [];
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      written.push(chunk);
    },
  });

  const port = {
    readable,
    writable,
    open: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    setSignals: vi.fn().mockResolvedValue(undefined),
    getInfo: vi.fn().mockReturnValue({ usbVendorId: 0x303a, usbProductId: 0x1001 }),
  } as unknown as SerialPort;

  return { port, controller, written };
}

const FAST_OPTIONS = { ...DEFAULT_CONNECTION_OPTIONS, resetOnConnect: false }; // skip the 250ms DTR pulse delay

describe('WebSerialTransport', () => {
  it('delivers received bytes via onData', async () => {
    const { port, controller } = makeFakePort();
    const transport = new WebSerialTransport(port, FAST_OPTIONS);
    const received: Uint8Array[] = [];
    transport.onData((chunk) => received.push(chunk));

    await transport.connect();
    expect(transport.state).toBe('connected');

    controller.enqueue(new TextEncoder().encode('hello\n'));
    await new Promise((r) => setTimeout(r, 10));

    expect(received).toHaveLength(1);
    expect(new TextDecoder().decode(received[0])).toBe('hello\n');
  });

  it(
    'transitions to disconnected and fires onDisconnect("device") when the readable stream ' +
      'closes cleanly without a user-initiated disconnect() — e.g. a CP2102/native-USB driver ' +
      'hiccup that never fires a real USB unplug event. Regression test: before this fix the ' +
      'transport silently stopped delivering data while still reporting "connected".',
    async () => {
      const { port, controller } = makeFakePort();
      const transport = new WebSerialTransport(port, FAST_OPTIONS);
      const disconnectReasons: string[] = [];
      transport.onDisconnect((reason) => disconnectReasons.push(reason));

      await transport.connect();
      expect(transport.state).toBe('connected');

      controller.close();
      await new Promise((r) => setTimeout(r, 10));

      expect(transport.state).toBe('disconnected');
      expect(disconnectReasons).toEqual(['device']);
    },
  );

  it('reports reason "user" (not "device") on an explicit disconnect() call', async () => {
    const { port } = makeFakePort();
    const transport = new WebSerialTransport(port, FAST_OPTIONS);
    const disconnectReasons: string[] = [];
    transport.onDisconnect((reason) => disconnectReasons.push(reason));

    await transport.connect();
    await transport.disconnect();

    expect(transport.state).toBe('disconnected');
    expect(disconnectReasons).toEqual(['user']);
  });

  it('writes sent bytes to the port', async () => {
    const { port, written } = makeFakePort();
    const transport = new WebSerialTransport(port, FAST_OPTIONS);
    await transport.connect();

    await transport.write(new TextEncoder().encode('ping\n'));

    expect(written).toHaveLength(1);
    expect(new TextDecoder().decode(written[0])).toBe('ping\n');
  });
});
