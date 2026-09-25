# Widget catalog

## P0 — implemented (M2)

<!-- generated:start -->

- [Line chart](./line) (`line`) — Real-time line chart for one or more numeric channels.
- [Value](./value) (`value`) — A numeric or text KPI card.
- [Gauge](./gauge) (`gauge`) — A needle gauge with configurable color zones.
- [Indicator](./led) (`led`) — A status LED for a boolean, numeric, or text value.
- [Event log](./log) (`log`) — A scrolling log of device events.

<!-- generated:end -->

## Not yet implemented

The rest of the catalog (SPEC.md §4) — P1 (`xy`, `bar`, `pie`, `level`, `table`, `heat`, plus the control widgets `button`, `switch`, `slider`, `number`, `select`, `text`) and P2 (`hist`, `polar`, `compass`, `attitude`, `color`) — has a JSON Schema at `/protocol/schema/widgets/<kind>.schema.json` and worked examples in `/protocol/test-vectors/widgets.jsonl`, but no app-side widget yet. Pages for these arrive as each one is implemented (P1 in M5, P2 in M8+). See [adding a widget](../contributing/adding-a-widget) for how they get built.
