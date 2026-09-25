# Dashboard

The dashboard turns the widgets a device declares (or SerialDash auto-discovers) into a live, drag-and-drop grid.

::: info Scope note
This page covers the base grid (M2). Editing a widget's properties from the UI, switching a widget's type, creating widgets by hand, exporting/importing a profile, and locking the layout are all **M5** — SPEC.md §5.5 assigns them there.
:::

## Groups and tabs

A widget's `grp` property (default `"Principale"`) decides which tab it appears on. Auto-discovered widgets (see below) land in an `"Auto"` tab. Tabs only appear when a device declares more than one group.

## Layout

Widgets are placed left to right in `ord` order (then arrival order) using either the size the device declared (`size`) or a sensible default for that widget kind, wrapping into new rows as needed. Drag a widget to move it, drag its corner to resize it — both are saved automatically.

## Profiles

The layout is remembered per device: keyed by the device's name (from its `hi` message) if it has one, or by its USB vendor/product id if it doesn't. Reconnect the same device later — even after closing the tab — and your layout comes back exactly as you left it.

## Stale and orphaned widgets

A widget dims after 5 seconds (or its own `stale` setting) without new data. After a device reset, a widget that isn't re-declared within 2 seconds is marked orphaned (also dimmed) rather than removed — it stays until you clean it up yourself, so you don't lose a layout to a momentary hiccup.

## Auto-discovery

A channel with no widget pointing at it gets one automatically: a line chart for numbers, an indicator for booleans, a value card for text. Turn this off in Settings if you'd rather only see widgets the device explicitly declares.
