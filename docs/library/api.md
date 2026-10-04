# API reference

Hand-written, not generated — kept in sync with `lib/SerialDash/src/SerialDash.h`, `DashValue.h`, `internal/WidgetBuilder.h`, and `internal/DataBuilder.h`. When in doubt, those headers are the ground truth; this page is the readable version of the same surface.

Every chainable builder (`WidgetBuilder`, `UpdateBuilder`, `DataBuilder`) streams straight to the `Stream` as each method is called — nothing is buffered in RAM, and the line is only closed (with `}\n`) when the builder's destructor runs. That means a declaration or send **must be written as one statement**:

```cpp
// OK — one statement, flushed when the temporary is destroyed at the ';'.
dash.line("t", F("Temperature")).ch("t1").unit(F("C"));

// Wrong — splits the builder across statements; the line is flushed (incompletely)
// after the first one, and `b` is a moved-from, unusable object on the second.
auto b = dash.line("t", F("Temperature"));
b.ch("t1"); // don't do this
```

## `SerialDash`

`SerialDash dash(stream);` wraps any Arduino `Stream` (`Serial`, `Serial1`, `SoftwareSerial`, native USB CDC, `BluetoothSerial`...). It doesn't take ownership and doesn't call `stream.begin()` — initialize your Stream as usual.

### Lifecycle

| Method                      | Description                                                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `begin(name, fw = nullptr)` | Sends `hi` identifying the device, then invokes the `onDeclare` callback if one is already registered. `name` is required (max 32 chars); `fw` is an optional firmware version string (max 16 chars). Call once from `setup()`.                                                |
| `loop()`                    | Call on every pass of the sketch's `loop()`, unconditionally. Reads available bytes, dispatches complete lines, answers `hi`/`ping` and routes `c` (control) messages automatically. A too-long line is reported as an `rx overflow` event instead of crashing.                |
| `onDeclare(void (*cb)())`   | Registers the widget-declaration callback and invokes it immediately. Also re-invoked every time the app sends its own `hi` — not just once at boot — since a reconnecting app needs to see the same declarations again. Put every widget factory call here, not in `setup()`. |
| `appConnected()`            | `true` once a `hi` has been received from the app _and_ a `ping` arrived within the last 5s. Useful for gating expensive work ("only compute this if someone's actually watching").                                                                                            |

### Controls

| Method                                              | Description                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onControl(id, bool (*cb)(DashValue&))`             | Registers the handler for one control id. `id` can be `const char*` or `F(...)`. The callback returns `true` to accept (the library sends `ack ok:true`, then echoes the value back unless `setAutoEcho(false)`), or `false`/`v.reject(msg)` to refuse.                                      |
| `onAnyControl(bool (*cb)(const char*, DashValue&))` | Fallback invoked for any control id without its own `onControl` registration.                                                                                                                                                                                                                |
| `onText(void (*cb)(const char*))`                   | Registers a handler for plain lines that don't start with `@{` — lets a sketch keep its own pre-existing text commands alongside the protocol.                                                                                                                                               |
| `setAutoEcho(bool)`                                 | Disables the automatic value echo sent after an _accepted_ control, for sketches that want to send the applied value themselves (e.g. because it depends on a sensor reading taken slightly later). `ack` is always sent regardless — the app's pending-control state machine depends on it. |

See [Controls](../protocol/controls) for the full accept/reject/echo state machine this drives on the app side.

### Widget declarations

Every named factory below returns a [`WidgetBuilder`](#widgetbuilder-updatebuilder-properties) and comes in two overloads: `dash.kind(id)` and `dash.kind(id, title)`. Both are defined purely in terms of the generic `widget(id, kind)`, which is also public if you ever need a kind without a dedicated method yet.

| Category | Methods                                                                                                                      | Notes                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Generic  | `widget(id, kind)`                                                                                                           | `kind` is any string/`F()` — escape hatch for future kinds.                                                                    |
| Display  | `line`, `value`, `gauge`, `led`, `log`, `xy`, `bar`, `pie`, `level`, `table`, `heat`, `hist`, `polar`, `compass`, `attitude` | One method per kind in the [widget catalog](../widgets/).                                                                      |
| Controls | `button`, `toggle`, `slider`, `number`, `select`, `text`, `color`                                                            | `toggle()` sends `k:"switch"` — `switch` is a reserved C++ keyword, so the method name and wire kind differ for this one only. |

| Method        | Description                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `update(id)`  | Returns an [`UpdateBuilder`](#widgetbuilder-updatebuilder-properties) — merges properties into an existing declaration (`u`). `id`/kind can't be changed this way. |
| `remove(id)`  | Removes one widget (`x` with `id`).                                                                                                                                |
| `removeAll()` | Removes every widget this device has declared (`x` with no `id`).                                                                                                  |

### Sending data

| Method                                              | Description                                                                                                                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data()`                                            | Returns a [`DataBuilder`](#databuilder) for a multi-channel `d` message: `dash.data().add("a", 1).add("b", 2);`.                                                                                                                                                                     |
| `send(channel, value)`                              | Single-channel shortcut for `data().add(channel, value)`. Overloaded for `int`, `long`, `unsigned int`, `unsigned long`, `double`/`float` (with an optional `decimals` param, default `SERIALDASH_FLOAT_DECIMALS`), `bool`, and any string type (`const char*`, `F(...)`, `String`). |
| `sendXY(channel, x, y, decimals = ...)`             | Shortcut for `data().addXY(...)` — an `[x, y]` pair, for `xy`/`polar` widgets.                                                                                                                                                                                                       |
| `sendArray(channel, values, count, decimals = ...)` | Shortcut for `data().addArray(...)` — a raw array, for `heat`/`bar` (spectrum) widgets. Overloaded for `const float*`, `const int16_t*`, `const uint8_t*`; takes a pointer + length so nothing is ever allocated.                                                                    |

### Events

| Method                                                                 | Description                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug(msg, src = nullptr)` / `info(...)` / `warn(...)` / `error(...)` | Sends a structured log event (`e`) at that level, shown in the console and in `log` widgets. `src` is an optional origin string for filtering.                                                                                    |
| `debugf(fmt, ...)` / `infof(...)` / `warnf(...)` / `errorf(...)`       | printf-style variants. **Not available on AVR** (`__AVR__`) — they need a 128-byte stack buffer for formatting, which isn't worth budgeting on the smallest boards. Use the non-`f` methods with pre-built strings there instead. |

## `WidgetBuilder` / `UpdateBuilder` properties

Both classes share the exact same chainable property surface (`PropertyWriter`) — `WidgetBuilder` (from a factory method or `widget()`) opens a new declaration with an `id`/`k`; `UpdateBuilder` (from `update(id)`) merges properties into an existing one instead. Every method returns `*this` for chaining.

### Common — every widget kind

| Method                          | Wire field  | Description                                                                                                                    |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `title(text)`                   | `title`     | Display title.                                                                                                                 |
| `ch(id)` / `ch(id1, id2, ...)`  | `ch`        | One channel, or several for multi-channel widgets (`line`'s multiple traces, etc.).                                            |
| `labels(text...)`               | `labels`    | Labels paired positionally with `ch(...)`'s channels.                                                                          |
| `colors(hex...)`                | `colors`    | Colors paired positionally with `ch(...)`'s channels.                                                                          |
| `group(name)`                   | `grp`       | Groups widgets under a shared heading in the dashboard.                                                                        |
| `order(n)`                      | `ord`       | Initial placement order within the widget's group.                                                                             |
| `size(widthCells, heightCells)` | `size`      | Suggested size in 12-column grid cells.                                                                                        |
| `unit(text)`                    | `unit`      | Unit suffix shown next to the value.                                                                                           |
| `decimals(n)`                   | `dec`       | Decimal places to display, 0–6.                                                                                                |
| `stale(seconds)`                | `stale`     | Seconds of no update before the widget is shown as stale (default 5).                                                          |
| `range(lo, hi)`                 | `min`/`max` | Used by `line`/`gauge`/`level`/`slider`/`number` — same two fields regardless of kind.                                         |
| `disabled()`                    | `dis`       | Marks a control disabled in the UI.                                                                                            |
| `confirm(text)`                 | `confirm`   | Requires a confirmation dialog with this text before a control fires.                                                          |
| `value(v)`                      | `val`       | Initial/current value. Overloaded for `int`/`long`/`unsigned int`/`unsigned long`/`double`/`float`(+decimals)/`bool`/string.   |
| `prop(key, v)`                  | _(custom)_  | Escape hatch for a property without a dedicated method — writes `"key":v` verbatim. Same value-type overload set as `value()`. |

### Per kind

| Kind(s)            | Method                                   | Wire field        | Description                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `line`             | `window(seconds)`                        | `win`             | Rolling time window shown.                                                                                                                                                                                                   |
| `line`             | `step(stepped = true)`                   | `step` (bool)     | Stair-step rendering.                                                                                                                                                                                                        |
| `line`             | `fill(filled = true)`                    | `fill`            | Fill area under the curve.                                                                                                                                                                                                   |
| `slider`, `number` | `stepSize(s)`                            | `step` (numeric)  | Increment step. Separate method name from `line`'s `step(bool)` — C++ can't overload `step(bool)`/`step(double)` without ambiguity for plain integer-literal calls like `step(1)`.                                           |
| `value`            | `trend(show = true)`                     | `trend`           | Trend arrow.                                                                                                                                                                                                                 |
| `value`            | `minmax(show = true)`                    | `minmax`          | Session min/max.                                                                                                                                                                                                             |
| `value`            | `warn(lo, hi)`                           | `warn`            | Warning threshold band.                                                                                                                                                                                                      |
| `value`            | `alarm(lo, hi)`                          | `alarm`           | Alarm threshold band.                                                                                                                                                                                                        |
| `led`, `switch`    | `on(colorOrLabel)` / `off(colorOrLabel)` | `on`/`off`        | A color for `led`, a label for `switch` — same two fields either way.                                                                                                                                                        |
| `led`              | `state(value, label, color)`             | `states`          | One entry of the `value -> [label, color]` map; call once per state.                                                                                                                                                         |
| `gauge`, `level`   | `zone(from, to, color)`                  | `zones`           | One `[from, to, color]` band; call once per zone.                                                                                                                                                                            |
| `level`, `slider`  | `vert(vertical = true)`                  | `vert`            | Vertical orientation.                                                                                                                                                                                                        |
| `log`              | `minLevel(level)`                        | `lvl`             | Minimum level shown.                                                                                                                                                                                                         |
| `log`              | `sources(src...)`                        | `src`             | Filters to these source names only.                                                                                                                                                                                          |
| `log`              | `limit(n)`                               | `max`             | Max rows kept. Named `limit`, not `max` — Arduino's AVR core `#define`s a `max(a,b)` macro that would otherwise mangle a method literally named `max`. Also reused by the `text` control below (`max`) for max input length. |
| `text` (control)   | `placeholder(text)`                      | `ph`              | Placeholder text.                                                                                                                                                                                                            |
| `text` (control)   | `limit(n)`                               | `max`             | Max input length (same method as `log`'s row limit, different kind).                                                                                                                                                         |
| `pie`              | `donut(show = true)`                     | `donut`           | Donut-hole rendering.                                                                                                                                                                                                        |
| `pie`              | `pct(show = true)`                       | `pct`             | Show percentages.                                                                                                                                                                                                            |
| `bar`              | `horiz(horizontal = true)`               | `horiz`           | Horizontal bars.                                                                                                                                                                                                             |
| `bar`              | `xlabels(text...)`                       | `xlabels`         | Per-bar labels for array (spectrum) data.                                                                                                                                                                                    |
| `table`            | `cols(header...)`                        | `cols`            | Column headers (one per column).                                                                                                                                                                                             |
| `heat`             | `cols(columnCount)`                      | `cols`            | Matrix column count — a different overload of the same method name as `table`'s headers, resolved by argument type (`int` vs. strings).                                                                                      |
| `heat`             | `rows(rowCount)`                         | `rows`            | Matrix row count.                                                                                                                                                                                                            |
| `heat`             | `palette(name)`                          | `palette`         | Named color palette.                                                                                                                                                                                                         |
| `heat`             | `interp(interpolate = true)`             | `interp`          | Bilinear interpolation between cells.                                                                                                                                                                                        |
| `hist`             | `bins(binCount)`                         | `bins`            | Histogram bin count.                                                                                                                                                                                                         |
| `hist`             | `samples(n)`                             | `samples`         | Sample window size.                                                                                                                                                                                                          |
| `polar`            | `rmax(r)`                                | `rmax`            | Radius scale.                                                                                                                                                                                                                |
| `polar`            | `angleRange(aminDeg, amaxDeg)`           | `angleRange`      | Angular sector shown.                                                                                                                                                                                                        |
| `polar`            | `sweep(clearOnPass = true)`              | `sweep`           | Clear the plot each sweep pass.                                                                                                                                                                                              |
| `compass`          | `ref(point...)`                          | `ref`             | Localized cardinal-point labels (`N`/`E`/`S`/`W` by default).                                                                                                                                                                |
| `button`           | `hold(holdToActivate = true)`            | `hold`            | Requires press-and-hold instead of a tap.                                                                                                                                                                                    |
| `button`           | `label(text)`                            | `label`           | Button label.                                                                                                                                                                                                                |
| `button`           | `color(hex)`                             | `color`           | Button color.                                                                                                                                                                                                                |
| `xy`               | `xrange(lo, hi)` / `yrange(lo, hi)`      | `xrange`/`yrange` | Axis ranges.                                                                                                                                                                                                                 |
| `xy`               | `trail(points)`                          | `trail`           | Trail length in points.                                                                                                                                                                                                      |
| `xy`               | `mode(text)`                             | `mode`            | `"points"` or `"lines"`.                                                                                                                                                                                                     |
| `xy`               | `xlabel(text)` / `ylabel(text)`          | `xlabel`/`ylabel` | Axis labels.                                                                                                                                                                                                                 |
| `select`           | `option(value)` / `option(value, label)` | `opts`            | One entry of the option list; call once per option.                                                                                                                                                                          |
| `color` (control)  | `swatches(hex...)`                       | `swatches`        | Quick-pick color swatches.                                                                                                                                                                                                   |

## `DataBuilder`

Returned by `dash.data()`. Each `.add(channel, value)` writes one more entry into the message's `d` object; `.map(channel)` opens a nested label→value object for that channel instead, filled by consecutive `.kv(label, value)` calls until a non-`kv` call or the end of the statement closes it. `dash.send()`/`sendXY()`/`sendArray()` are single-channel convenience wrappers built on this same class.

| Method                                             | Description                                                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ts(ms)`                                           | Device timestamp (typically `millis()`). Can appear anywhere in the chain — buffered and written by the destructor, since `ts` sits next to `d` rather than inside it. |
| `add(channel, v)`                                  | One `"channel":value` entry. Overloaded for `int`/`long`/`unsigned int`/`unsigned long`/`double`/`float`(+decimals)/`bool`/string — the same set `send()` exposes.     |
| `addXY(channel, x, y, decimals = ...)`             | `[x, y]` pair, for `xy`/`polar` widgets.                                                                                                                               |
| `addArray(channel, values, count, decimals = ...)` | Raw array, for `heat`/`bar` (spectrum) widgets. Overloaded for `const float*`, `const int16_t*`, `const uint8_t*`.                                                     |
| `map(channel)`                                     | Opens a label→value object for one channel (for `pie`/`bar`/`table` widgets fed an object rather than a bare number).                                                  |
| `kv(label, v)`                                     | One `label:value` entry inside a `map()`. Same value-type overload set as `add()`.                                                                                     |

```cpp
// Multi-channel scalar send:
dash.data().add("temp", 22.5).add("hum", 61);

// A pie/table/bar widget fed a label->value object for one channel:
dash.data().map("errors").kv("timeout", 3).kv("crc", 1);
```

## `DashValue`

Passed by reference to `onControl`/`onAnyControl` callbacks — wraps whatever the app sent in a control's `v` field, with tolerant conversions. `toString()`'s pointer (and the value generally) is only valid for the duration of the callback: it points into the library's one shared receive-line buffer, which the next line read overwrites.

| Method                                                | Description                                                                                                                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type()`                                              | Returns `DashValue::Type::Number`/`Bool`/`String`/`Null`.                                                                                                                                                         |
| `isNumber()` / `isBool()` / `isString()` / `isNull()` | Type queries.                                                                                                                                                                                                     |
| `toInt()` / `toLong()` / `toFloat()`                  | Tolerant numeric conversion — a bool becomes `0`/`1`, a string is parsed with `atol`/`atof` (`0` if unparseable).                                                                                                 |
| `toBool()`                                            | A nonzero number is `true`; the strings `""`, `"0"`, and `"false"` are `false`, every other non-null string is `true`.                                                                                            |
| `toString()`                                          | Valid only when `isString()`.                                                                                                                                                                                     |
| `equals(const char* other)`                           | Shortcut for `isString() && strcmp(toString(), other) == 0`.                                                                                                                                                      |
| `set(v)`                                              | Replaces the value echoed back to the app after a successful control — e.g. clamping a slider's requested value to what was actually applied. Overloaded for `int`/`long`/`double`/`bool`/`const char*`/`F(...)`. |
| `reject(msg)`                                         | Rejects the control: `ack` carries `ok:false` and `msg` as `err`, no value echo is sent. Always returns `false`, so a handler can `return v.reject(F("reason"));`. Takes `const char*` or `F(...)`.               |

See [Controls](../protocol/controls) for a worked accept/clamp/reject example.

## Where to go next

- [Getting started](./getting-started) — the four calls every sketch makes, with a full worked example.
- [Widget catalog](../widgets/) — every kind's properties and a runnable example, one page per kind.
- [Compile-time options](./options) — `SERIALDASH_*` buffer/limit macros.
- `lib/SerialDash/examples/` — runnable sketches exercising this whole surface.
