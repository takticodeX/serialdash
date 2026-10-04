---
title: Serial Dash
---

# Serial Dash

A serial monitor and live dashboard for Arduino, ESP32, ESP8266, RP2040 and friends — running entirely in your browser via [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API). No install, works offline after the first visit, and stays fully compatible with plain `Serial.println` sketches (no library required — see [Arduino Plotter compatibility](./guide/plotter-compat)).

Point it at a running sketch and it turns `Serial.println("temp:23.4")` into a live line chart automatically — or, with the optional `SerialDash` library, declare gauges, tables, and two-way controls (buttons, sliders, color pickers) from a few lines of C++.

::: tip Try it without any hardware
Every guide on this site can be followed with the built-in simulator ("Try without hardware" on the connect screen) — no board required to see what Serial Dash does.
:::

- **[Quick start](./guide/quick-start)** — connect a board and see your first chart in five minutes.
- **[Widget catalog](./widgets/)** — every chart, gauge, and control type the protocol supports.
- **[Arduino / ESP32 library](./library/install)** — optional C++ helper for declaring widgets and two-way controls from a sketch.
- **[Protocol reference](./protocol/overview)** — implement Serial Dash's JSON protocol in any language.
- **[Contributing](./contributing/architecture)** — architecture, ADRs, and how to add a widget.
