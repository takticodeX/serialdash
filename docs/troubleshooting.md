# Troubleshooting

## "This browser can't talk to a serial port"

You're on Firefox, Safari, or another browser without the Web Serial API. See [compatibility](./compatibility) for the supported list (Chrome, Edge, Opera, Brave). You can still explore SerialDash's simulator from that same screen — just not a real device.

## "The port is in use by another program"

Something else already has the port open — most commonly the Arduino IDE's own Serial Monitor, or a second SerialDash tab. Close the other program (or tab) and try again. See [Connecting](./guide/connecting#if-the-port-is-busy).

## My board's port doesn't show up in the picker

The browser's port picker only lists ports your OS actually sees. Check the board shows up in your OS's own device list first (Device Manager on Windows, `ls /dev/tty.*` on macOS, `ls /dev/ttyUSB*`/`ls /dev/ttyACM*` on Linux) — if it doesn't, that's a driver problem, not a SerialDash one. Common culprits: a missing CH340 or CP210x driver (needed by many clone boards), or a USB cable that's power-only (no data lines).

## I see garbled/random characters in the console

Almost always a baud rate mismatch — the value in the connect screen has to match what your sketch passes to `Serial.begin()`. 115200 is the default and what most modern sketches use; check yours if you changed it (or copied an older sketch that uses 9600).

## My ESP32 resets into "waiting for download" / seems stuck after connecting

That message means the chip booted into its ROM bootloader instead of running your sketch — normal when you're about to flash it, not when you just want to watch its output. If it happens on every connect:

- Try connecting with **Reset the board on connect** turned off (Settings on the connect screen) — some boards' auto-reset wiring doesn't play well with every USB-serial adapter.
- If it also happens when you press the board's own physical reset button while connected, disconnect and reconnect (or unplug/replug the USB cable) once — this clears the port's control-line state.
- This is a hardware handshake quirk between the USB-serial chip (CP2102/CH340/native USB) and the board's auto-reset circuit, not something a sketch can trigger on its own.

## The dashboard shows widgets but no data is moving

- Check the console panel (below the dashboard) — if you see plain text lines but no chart movement, and they don't look like `label:value` or comma-separated numbers, SerialDash has nothing to recognize them as data automatically. Either use the [library](./library/getting-started) to declare widgets explicitly, or match the [Plotter-compatible format](./guide/plotter-compat).
- If **Show protocol lines** is off (Settings), SerialDash's own `@{...}` protocol lines are hidden from the console by design — that's not an error, toggle it on if you want to see the raw wire traffic.
- Check the status bar's protocol-error count (top right, red, only shown when non-zero) — clicking it filters the console to just the problem lines.

## A control shows an error when I use it

Hover the widget for the error text. `"unknown control"` means the device never registered an `onControl` handler for that widget's id — check the sketch's `dash.onControl(...)` calls match the widget's `id` exactly. A timeout message means no `ack` came back within the configured window (Settings → control response timeout) — the device may be busy, crashed, or the sketch never calls `dash.loop()` often enough to process incoming commands.

## The status bar says "Device not responding"

SerialDash pings a connected device every 2 seconds; three missed replies in a row trigger this. It usually means the sketch stopped calling `dash.loop()` (e.g. stuck in a blocking `delay()` or crashed) rather than a connection problem — if the port itself dropped, you'd see a disconnect instead.

## My dashboard layout disappeared after reconnecting

Layouts are saved per device, keyed by the name your sketch passes to `dash.begin()` (or by USB vendor/product id if the device never sent one). If you changed that name, or you're running a different sketch on the same board, SerialDash treats it as a different device and starts with a fresh layout.

## SerialDash doesn't work offline

The first visit needs a real network connection so the service worker can cache the app. After that first successful load, it works fully offline — check your browser's dev tools (Application → Service Workers) if it isn't, since some browsers clear the cache when storage runs low.
