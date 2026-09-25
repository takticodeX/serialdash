# Adding a widget

::: info
Steps 2–4 need the widget registry and rendering layer, which arrive in **M2** (SPEC.md §11). Step 1 — the schema — is real today and is where every new widget starts, so it's documented here now.
:::

1. **Add the widget's SPEC.md §4 entry** and its JSON Schema file under `/protocol/schema/widgets/<kind>.schema.json`. Follow the existing files as a template:
   - `allOf` reference `common.schema.json#/$defs/widgetBase` (and, for controls, also `#/$defs/controlExtras`).
   - Give the top-level schema its own `"type": "object"` (Ajv strict mode wants this even though `allOf` already implies it).
   - Constrain `k` with `{"const": "<kind>"}`.
   - Add the kind to the `oneOf` list in `device-to-app.schema.json`'s `$defs.w`.
2. **Add test vectors** to `/protocol/test-vectors/widgets.jsonl`: at least one valid declaration, and one invalid case if the widget has required fields.
3. **Regenerate and check**: `npm run gen` (updates `app/src/protocol/generated/*.ts` and the `docs/protocol/messages.md` generated block) and `npm test` (validates every vector against the schema — PRO-03/PRO-04).
4. **(M2+) Register the widget**: a descriptor in `app/src/widgets/<kind>/` exporting the render component, config panel, and a demo example used by the simulator, the docs generator (DOC-01), and e2e tests. A widget without a complete descriptor fails the build (SPEC.md §4).
5. **Document it**: once the descriptor exists, `npm run gen` (via `tools/gen-docs`, M2+) produces `docs/widgets/<kind>.md` automatically — don't hand-write that page.

See the Definition of Done in `CLAUDE.md` (repository root, SPEC.md §9.5) before calling a widget finished.
