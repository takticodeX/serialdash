/** APP-DSH-03: dashboard profiles are keyed by the device's `hi` name, falling back to its USB
 * VID/PID when there's no handshake (text-mode session). */
export function getDeviceProfileKey(
  port: SerialPort | null,
  deviceName: string | undefined,
): string {
  if (deviceName) return `name:${deviceName}`;
  const info = port?.getInfo();
  if (info?.usbVendorId !== undefined) {
    return `vidpid:${info.usbVendorId}:${info.usbProductId ?? ''}`;
  }
  return 'unknown';
}
