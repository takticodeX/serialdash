# Console

The console shows every line your device sends, in the order it arrives — a drop-in replacement for the Arduino IDE's Serial Monitor, plus a few things it doesn't have.

::: info Scope note
This page covers what M1 ships. Recognizing SerialDash protocol lines (`@{...}`) — dimming them, showing protocol errors in red, or filtering to errors only — arrives with the protocol parser in **M2**; until then every line is shown as plain text.
:::

## Reading

- Lines render in a monospace font, virtualized so the view stays smooth even with tens of thousands of lines. The line limit (default 20000) is configurable in Settings — older lines are dropped once you're over it.
- **Timestamps**: toggle a per-line receive time in the toolbar.
- **Wrap**: long lines wrap instead of scrolling horizontally.
- **Hex view**: shows the raw bytes of each line instead of decoded text — useful when you suspect a baud-rate mismatch or a binary payload.
- **ANSI colors**: the 16 standard SGR colors plus bold are rendered, if your firmware sends them.
- **Search**: filters the visible lines to ones containing your text, and highlights the match.

## Autoscroll

The console follows new output by default. Scroll up to read older lines and it pauses automatically; a "↓ New lines" button appears showing how many arrived while you were reading. Scroll back to the bottom (or click the button) to resume.

## Sending

Type in the field at the bottom and press Enter, or click Send. Choose the line ending (LF, CR, CRLF, or none) from the dropdown next to it — LF is the default. Use ↑/↓ to move through your last 50 sent lines, which persist across sessions.

## Managing the console

- **Clear** empties the view.
- **Copy all** copies every visible line to the clipboard.
- **Save as .txt** downloads the console contents as a text file.

## Panel

The console panel can be resized (drag the handle above it) and collapsed to just its toolbar — both persist. Once the dashboard exists (M2), you'll also be able to choose whether the console sits beside or below it.
