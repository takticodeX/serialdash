import type { ConnectionState, Transport, TransportInfo } from '../transport/transport';
import { friendlyUsbName } from './usbNames';

export interface SerialConnectionOptions {
  baudRate: number;
  dataBits: 7 | 8;
  parity: 'none' | 'even' | 'odd';
  stopBits: 1 | 2;
  flowControl: 'none' | 'hardware';
  /** "Reset the board on connect" (default) vs. "Don't reset" — APP-CON-04. */
  resetOnConnect: boolean;
}

export const DEFAULT_CONNECTION_OPTIONS: SerialConnectionOptions = {
  baudRate: 115200,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: 'none',
  resetOnConnect: true,
};

export const BAUD_RATE_PRESETS = [
  300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 460800, 921600,
  1000000, 2000000,
] as const;

/** Thrown when the OS/another app already has the port open (APP-CON-07). */
export class PortBusyError extends Error {
  constructor(cause: unknown) {
    super('Serial port is already in use by another program', { cause });
    this.name = 'PortBusyError';
  }
}

function isPortBusy(err: unknown): boolean {
  // Chromium raises a plain "NetworkError" DOMException when the underlying OS handle is busy.
  return err instanceof DOMException && err.name === 'NetworkError';
}

/**
 * On the classic CP2102/CH340 auto-program circuit these ESP32/ESP8266 boards almost all use,
 * DTR asserted (`true`) pulls GPIO0 low (bootloader strap) and RTS asserted (`true`) pulls EN low
 * (chip held in reset) — the same mapping esptool.py's own reset sequences rely on. "Reset the
 * board on connect" must reset into the *running sketch*, not the ROM bootloader: that means
 * pulsing RTS (EN) low then high while DTR (GPIO0) stays deasserted throughout, mirroring the
 * Arduino IDE's own auto-reset / esptool's `hard_reset()` — never esptool's *bootloader-entry*
 * sequence, which deliberately asserts DTR *before* releasing RTS so GPIO0 is sampled low at the
 * moment of reset.
 *
 * Previously this pulsed DTR instead of RTS and left DTR asserted (`true`) as the final state
 * either way (even with "reset on connect" off). That never actually reset the chip via EN, and
 * left GPIO0 held low for as long as the port stayed open — so the *next* reset from any source
 * (a later reconnect, or the board's own physical reset button) would sample GPIO0 low and land
 * back in the ROM bootloader ("waiting for download") instead of the sketch. Both signals are now
 * left fully deasserted once this returns, so a later reset — from wherever it comes — boots
 * normally.
 */
async function pulseResetSignals(port: SerialPort, resetOnConnect: boolean): Promise<void> {
  if (resetOnConnect) {
    await port.setSignals({ dataTerminalReady: false, requestToSend: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  } else {
    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  }
}

export function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.serial);
}

export async function requestNewPort(): Promise<SerialPort> {
  return navigator.serial.requestPort();
}

export async function getAuthorizedPorts(): Promise<SerialPort[]> {
  return navigator.serial.getPorts();
}

export function describePort(port: SerialPort): TransportInfo {
  const info = port.getInfo();
  const name = friendlyUsbName(info.usbVendorId, info.usbProductId);
  if (name) return { label: name };
  if (info.usbVendorId !== undefined) {
    return { label: `USB serial (VID 0x${info.usbVendorId.toString(16).padStart(4, '0')})` };
  }
  return { label: 'Serial port' };
}

type DataListener = (chunk: Uint8Array) => void;
type StateListener = (state: ConnectionState) => void;
type DisconnectListener = (reason: 'user' | 'device' | 'error') => void;

export class WebSerialTransport implements Transport {
  private _state: ConnectionState = 'disconnected';
  private writer: WritableStreamDefaultWriter<Uint8Array> | undefined;
  private reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  private readLoopAbort = false;

  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();
  private readonly disconnectListeners = new Set<DisconnectListener>();

  constructor(
    private readonly port: SerialPort,
    private readonly options: SerialConnectionOptions,
  ) {}

  get info(): TransportInfo {
    return describePort(this.port);
  }

  get state(): ConnectionState {
    return this._state;
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    for (const listener of this.stateListeners) listener(state);
  }

  async connect(): Promise<void> {
    this.setState('connecting');
    try {
      await this.port.open({
        baudRate: this.options.baudRate,
        dataBits: this.options.dataBits,
        parity: this.options.parity,
        stopBits: this.options.stopBits,
        flowControl: this.options.flowControl,
      });
    } catch (err) {
      this.setState('disconnected');
      throw isPortBusy(err) ? new PortBusyError(err) : err;
    }

    await pulseResetSignals(this.port, this.options.resetOnConnect);

    if (!this.port.writable || !this.port.readable) {
      this.setState('disconnected');
      throw new Error('Serial port opened but is not readable/writable');
    }
    this.writer = this.port.writable.getWriter();
    this.setState('connected');
    void this.readLoop();
  }

  private async readLoop(): Promise<void> {
    this.readLoopAbort = false;
    if (!this.port.readable) return;
    this.reader = this.port.readable.getReader();
    let closedCleanly = false;
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) {
          closedCleanly = true;
          break;
        }
        if (value) for (const listener of this.dataListeners) listener(value);
      }
    } catch (err) {
      if (!this.readLoopAbort) {
        this.setState('disconnected');
        for (const listener of this.disconnectListeners) listener('device');
        throw err instanceof Error ? err : new Error(String(err));
      }
    } finally {
      this.reader?.releaseLock();
      this.reader = undefined;
    }
    // The readable stream can end without throwing — e.g. the OS/driver briefly re-enumerating
    // the port (common with CP2102/native-USB boards) closes it "cleanly" from the Streams API's
    // point of view. Without this, the transport silently stops delivering data while still
    // reporting 'connected', which looks like the app hung rather than lost the device.
    if (closedCleanly && !this.readLoopAbort) {
      this.setState('disconnected');
      for (const listener of this.disconnectListeners) listener('device');
    }
  }

  async disconnect(): Promise<void> {
    this.setState('disconnecting');
    this.readLoopAbort = true;
    try {
      await this.reader?.cancel();
    } catch {
      // ignored — the port may already be gone (device unplugged).
    }
    this.writer?.releaseLock();
    this.writer = undefined;
    try {
      await this.port.close();
    } catch {
      // ignored — closing an already-closed/errored port is not actionable here.
    }
    this.setState('disconnected');
    for (const listener of this.disconnectListeners) listener('user');
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.writer) throw new Error('Not connected');
    await this.writer.write(data);
  }

  onData(listener: DataListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onDisconnect(listener: DisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => this.disconnectListeners.delete(listener);
  }
}
