# Dashboard

The dashboard turns the widgets a device declares (or SerialDash auto-discovers) into a live, drag-and-drop grid.

## Groups and tabs

A widget's `grp` property (default `"Principale"`) decides which tab it appears on. Auto-discovered widgets land in an `"Auto"` tab. Tabs only appear when a device declares more than one group.

## Layout

Widgets are placed left to right in `ord` order (then arrival order) using either the size the device declared (`size`) or a sensible default for that widget kind, wrapping into new rows as needed. Drag a widget to move it, drag its corner to resize it — both are saved automatically.

Tick **Lock layout** in the toolbar to freeze dragging and resizing without losing anything you've already arranged — handy once a dashboard is the way you want it and you'd rather not nudge a widget by accident.

## Profiles

The layout is remembered per device: keyed by the device's name (from its `hi` message) if it has one, or by its USB vendor/product id if it doesn't. Reconnect the same device later — even after closing the tab — and your layout comes back exactly as you left it.

**Export profile** downloads everything that makes a dashboard "yours" for the current device — layout, widget overrides, and any widgets you added by hand — as a single `dashboard.serialdash.json` file. **Import profile** loads one back in. This is how you move a dashboard to another browser or machine, or keep a backup before trying a big rearrangement.

## Per-widget actions

Each widget has a small toolbar in its top-right corner:

- **⚙ Settings** opens a side panel for that widget: the kind's own configuration fields, a **type** picker if the widget's current kind has value-compatible alternatives (e.g. a `line` chart can become a `value` card, since both read a single numeric channel), and either **reset to device value** — clears any override so the widget goes back to exactly what the device declared — or, for a widget you added yourself, **delete widget**.
- **⛶ Fullscreen** expands the widget to fill the screen; useful for keeping an eye on one chart from across the room.
- **⬇ Export CSV** downloads that widget's channel data — one row per channel per sample, sorted by time.
- **↺ Reset stats** (value widgets only) clears the running min/max shown on the card, without touching the underlying data.

## Adding widgets by hand

**+ Add widget** lets you bind a widget from the catalog to any channel that's produced data so far, with no device involvement — useful for a second view of a channel the device already covers, or for channels the device sends without declaring a widget for at all. These are stored alongside your layout/overrides and travel with profile export/import; they have no device declaration to "reset to," so their settings panel offers delete instead.

## Stale and orphaned widgets

A widget dims after 5 seconds (or its own `stale` setting) without new data. After a device reset, a widget that isn't re-declared within 2 seconds is marked orphaned (also dimmed) rather than removed — it stays until you clean it up yourself, so you don't lose a layout to a momentary hiccup.

## Auto-discovery

A channel with no widget pointing at it gets one automatically, based on the shape of its values: a line chart for numbers, an indicator for booleans, a value card for text, an XY plot for `[x, y]` pairs, a bar chart for other arrays, and a table for objects. Turn this off in Settings if you'd rather only see widgets the device explicitly declares.

::: info Scope note
PNG export of a widget (or the whole dashboard) is described in SPEC.md §5.5 (APP-DSH-07) but is not implemented as of **M5** — deferred by explicit choice, since none of the app's DOM/SVG/canvas widgets have any existing screenshot capability and adding one means a new rendering dependency. CSV export covers the same "get my data out" need in the meantime.
:::
