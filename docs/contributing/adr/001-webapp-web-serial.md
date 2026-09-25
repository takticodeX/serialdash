# ADR-001: Webapp with Web Serial

## Context

The classic Arduino IDE Serial Monitor requires installing the IDE. SerialDash's principle P1 is "zero installation: just a link" and P6 is "privacy: no data leaves the computer, no backend." We need a way to talk to a USB-serial device directly from a normal web page.

## Decision

Build SerialDash as an installable PWA using the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) (`navigator.serial`) for the device connection, with no server component at all — everything, including the protocol parser, dashboard, and storage, runs client-side.

## Consequences

- Firefox and Safari don't support Web Serial, so they're out of scope for v1 (SPEC.md §1.2). The app detects this and still offers the simulator and replay, which need no serial access at all (APP-GEN-02).
- No backend means no telemetry and no account system by construction — P6 is satisfied structurally, not by policy.
- Hosting is trivial: a static site on GitHub Pages (see [ADR-005](./005-stack)) is enough.
- A future WebSocket transport for Wi-Fi-connected boards (SPEC.md §10) is possible later because the app already talks to an abstract `Transport` interface, not directly to `navigator.serial`.
