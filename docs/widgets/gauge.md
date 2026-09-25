# Gauge

<!-- generated:start -->

A needle gauge with configurable color zones.

**Value:** A number.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `gauge`-specific properties are listed below.

| Property | Type    | Required | Description |
| -------- | ------- | -------- | ----------- |
| `max`    | number  | **yes**  |             |
| `min`    | number  | **yes**  |             |
| `zones`  | any[][] | no       |             |

## Example

```json
@{"t":"w","id":"g1","k":"gauge","ch":"h","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}
```

<!-- generated:end -->

## Arduino library example

Arrives with the library (M3) — the builder method for `k: "gauge"`, and a runnable example sketch.

## Compatible templates for switching type

Arrives with dashboard overrides (M5, APP-DSH-05).
