# Widget catalog

<!-- generated:start -->

## Display

- [Line chart](./line) (`line`) — Real-time line chart for one or more numeric channels.
- [Value](./value) (`value`) — A numeric or text KPI card.
- [Gauge](./gauge) (`gauge`) — A needle gauge with configurable color zones.
- [Indicator](./led) (`led`) — A status LED for a boolean, numeric, or text value.
- [Event log](./log) (`log`) — A scrolling log of device events.
- [XY plot](./xy) (`xy`) — A scatter or line plot of [x, y] pairs.
- [Bar chart](./bar) (`bar`) — One bar per channel, label, or array element.
- [Pie chart](./pie) (`pie`) — A pie or donut chart of labeled values.
- [Level bar](./level) (`level`) — A horizontal or vertical fill/progress bar.
- [Table](./table) (`table`) — A key-value table, highlighting changed rows.
- [Heatmap](./heat) (`heat`) — A rows x cols color-mapped matrix.

## Controls

- [Button](./button) (`button`) — A push button that sends a command on click.
- [Switch](./switch) (`switch`) — An on/off toggle bound to a boolean control.
- [Slider](./slider) (`slider`) — A draggable numeric control.
- [Number field](./number) (`number`) — A numeric input control.
- [Select](./select) (`select`) — A dropdown choice control.
- [Text field](./text) (`text`) — A text input control.
- [Color picker](./color) (`color`) — A #RRGGBB color control.

<!-- generated:end -->

## Not yet implemented

`hist`, `polar`, `compass`, `attitude` (SPEC.md §4, P2) have a JSON Schema at `/protocol/schema/widgets/<kind>.schema.json` and worked examples in `/protocol/test-vectors/widgets.jsonl`, but no app-side widget yet (M8+). See [adding a widget](../contributing/adding-a-widget) for how they get built.
