# Adding a widget

1. **Add the widget's SPEC.md §4 entry** and its JSON Schema file under `/protocol/schema/widgets/<kind>.schema.json`. Follow the existing files as a template:
   - `allOf` reference `common.schema.json#/$defs/widgetBase` (and, for controls, also `#/$defs/controlExtras`).
   - Give the top-level schema its own `"type": "object"` (Ajv strict mode wants this even though `allOf` already implies it).
   - Constrain `k` with `{"const": "<kind>"}`.
   - Add the kind to the `oneOf` list in `device-to-app.schema.json`'s `$defs.w`.
2. **Add test vectors** to `/protocol/test-vectors/widgets.jsonl`: at least one valid declaration, and one invalid case if the widget has required fields.
3. **Regenerate and check**: `npm run gen` (updates `app/src/protocol/generated/*.ts`, `docs/protocol/messages.md`, and `docs/widgets/*.md`) and `npm test` (validates every vector against the schema — PRO-03/PRO-04).
4. **Register the widget** in `app/src/widgets/<kind>/`, following an existing widget (`value` is the simplest) as a template. A descriptor (`app/src/widgets/index.ts`) needs:
   - `Component` — reads its channel(s) via `useChannelSeries`/`ChannelStore.latest()` (or, for a widget like `log` that doesn't use `ch`, straight from `DeviceSession`), wrapped in `WidgetCard` for the shared stale-dimming chrome.
   - `ConfigPanel` — even a minimal one; the dashboard's editing UI that uses it is M5, but the descriptor must be complete now (SPEC.md §4: an incomplete descriptor fails the build).
   - `demo` — a declaration plus a pure `generate(tickMs)` function producing that widget's channel values. This feeds the simulator's "All widgets" scenario, `tools/gen-docs`'s example JSON, and (later) e2e tests — keep it in a module with no heavy rendering-library imports (see `gauge/gaugeDemo.ts`) if the widget's `Component` pulls one in, so the demo stays cheap to load.
   - `defaultSize` — `[w, h]` in grid cells, used when a declaration has no `size` (APP-DSH-02).
   - If the widget pulls in a sizeable rendering library (SPEC.md §2.2 calls this out for ECharts specifically), lazy-load its `Component`/`ConfigPanel` with `React.lazy()` rather than importing them eagerly in `widgets/index.ts` — see how `gauge` does it.
5. **Documentation is generated** — once the descriptor and i18n strings (`widgets.<kind>.name`/`.description` in both locales) exist, `npm run gen` produces `docs/widgets/<kind>.md` automatically via `tools/gen-docs`. Don't hand-edit the generated block.

See the Definition of Done in `CLAUDE.md` (repository root, SPEC.md §9.5) before calling a widget finished.
