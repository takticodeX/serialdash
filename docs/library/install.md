# Install

## Arduino IDE — Library Manager

Once SerialDash is published to the Library Manager index: **Sketch → Include Library → Manage Libraries…**, search for "SerialDash", click **Install**. This is the easiest path once it's available — the Library Manager also handles updates for you.

## Arduino IDE — manual install

Until then (or if you want a specific commit/branch):

1. Download this repository as a zip, or `git clone` it.
2. Copy (or symlink) the `lib/SerialDash` folder into your Arduino sketchbook's `libraries/` folder — usually `~/Documents/Arduino/libraries/SerialDash` on macOS/Linux, `Documents\Arduino\libraries\SerialDash` on Windows. The library must be directly inside `libraries/`, not nested further.
3. Restart the Arduino IDE if it was already running — it only scans `libraries/` on startup.
4. `#include <SerialDash.h>` should now autocomplete, and the bundled examples appear under **File → Examples → SerialDash**.

## PlatformIO

Add it as a dependency in `platformio.ini`:

```ini
[env:your_board]
lib_deps =
    https://github.com/takticodeX/serialdash.git#lib-v1.0.0
```

(Pin to a tag once one exists — omitting `#lib-vX.Y.Z` tracks the default branch, which is fine for trying things out but not for a build you depend on.) Or, for local development against a clone of this repo, use a relative path instead:

```ini
lib_deps =
    symlink://../path/to/serialdash/lib/SerialDash
```

## Verifying the install

Compile [`02_FirstChart`](../guide/quick-start) for your board — it needs no wiring, just power and a USB connection.
