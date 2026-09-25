/** Friendly names for common USB-serial chips, from VID/PID (APP-CON-02). Not exhaustive — falls
 * back to a generic "USB serial device" label when the pair isn't recognized. */

interface ChipEntry {
  vendorId: number;
  productId?: number;
  name: string;
}

const KNOWN_CHIPS: ChipEntry[] = [
  { vendorId: 0x1a86, productId: 0x7523, name: 'CH340' },
  { vendorId: 0x1a86, productId: 0x5523, name: 'CH340' },
  { vendorId: 0x1a86, productId: 0x55d4, name: 'CH9102 (CH340 family)' },
  { vendorId: 0x10c4, productId: 0xea60, name: 'CP210x' },
  { vendorId: 0x0403, productId: 0x6001, name: 'FTDI FT232' },
  { vendorId: 0x0403, productId: 0x6015, name: 'FTDI FT230X' },
  { vendorId: 0x2e8a, productId: 0x0005, name: 'RP2040' },
  { vendorId: 0x2e8a, productId: 0x000a, name: 'RP2040 (PicoProbe)' },
  { vendorId: 0x2341, name: 'Arduino' },
  { vendorId: 0x2a03, name: 'Arduino (genuino)' },
  { vendorId: 0x303a, name: 'ESP32 (native USB)' },
];

export function friendlyUsbName(usbVendorId?: number, usbProductId?: number): string | undefined {
  if (usbVendorId === undefined) return undefined;

  const exact = KNOWN_CHIPS.find(
    (c) => c.vendorId === usbVendorId && c.productId !== undefined && c.productId === usbProductId,
  );
  if (exact) return exact.name;

  const byVendor = KNOWN_CHIPS.find((c) => c.vendorId === usbVendorId && c.productId === undefined);
  if (byVendor) return byVendor.name;

  return undefined;
}
