# Connecting

## Requirements

A Chromium-based browser (Chrome, Edge, Opera, Brave — see [compatibility](../compatibility)). If your browser doesn't support the Web Serial API, SerialDash shows an explanation instead of the connect screen.

## Connecting for the first time

1. Click **Connect**. The browser's own port picker opens — select your board and confirm. This is the browser asking your permission, not SerialDash; the site never sees the list of ports you didn't pick.
2. Pick a **baud rate** (115200 is the default and covers most sketches). **Advanced settings** exposes data bits, parity, stop bits, and flow control if your firmware needs something non-standard.
3. **Reset the board on connect** is on by default and pulses the board's reset line the same way the Arduino IDE does (a hard reset into the running sketch, not the bootloader), so a freshly opened connection sees the sketch's startup output. Turn it off if your board's reset behavior loses lines you care about, or if it isn't wired for auto-reset at all.
4. Click **Connect**. SerialDash remembers the port for next time (browser-side permission, not sent anywhere) and lists it under "previously used ports" so you can reconnect with one click.

## If the port is busy

If another program — commonly the Arduino IDE's own Serial Monitor — already has the port open, SerialDash tells you so directly instead of failing silently. Close the other program and try again.

## Disconnecting to upload a sketch

The "Disconnect to upload a sketch" button in the status bar frees the port so your IDE or uploader can use it. If **reconnect automatically** is on (Settings, default: on), SerialDash reconnects by itself as soon as the board reappears after the upload finishes.

## Reconnection

With auto-reconnect on, unplugging and replugging the same device reconnects it automatically, using the same settings you connected with — no need to click Connect again.
