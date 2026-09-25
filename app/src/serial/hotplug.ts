/** Wraps navigator.serial's global 'connect'/'disconnect' events (APP-CON-05: auto-reconnect
 * when a previously authorized device reappears). */

export function onSerialPortConnected(listener: (port: SerialPort) => void): () => void {
  const handler = (event: Event): void => {
    const port = (event as Event & { target: SerialPort }).target;
    listener(port);
  };
  navigator.serial.addEventListener('connect', handler);
  return () => navigator.serial.removeEventListener('connect', handler);
}

export function onSerialPortDisconnected(listener: (port: SerialPort) => void): () => void {
  const handler = (event: Event): void => {
    const port = (event as Event & { target: SerialPort }).target;
    listener(port);
  };
  navigator.serial.addEventListener('disconnect', handler);
  return () => navigator.serial.removeEventListener('disconnect', handler);
}
