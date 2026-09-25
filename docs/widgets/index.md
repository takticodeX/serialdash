# Widget catalog

::: info
Individual widget pages are generated from each widget's descriptor (`tools/gen-docs`, DOC-01), which needs the app-side widget registry from **M2**. That doesn't exist yet, so this index just lists what `/protocol/schema/widgets/` already defines.
:::

## Display widgets (SPEC.md §4.1)

`line`, `value`, `gauge`, `led`, `log`, `xy`, `bar`, `pie`, `level`, `table`, `heat`, `hist`, `polar`, `compass`, `attitude`

## Controls (SPEC.md §4.3)

`button`, `switch`, `slider`, `number`, `select`, `text`, `color`

Each has a JSON Schema file at `/protocol/schema/widgets/<kind>.schema.json` and at least one worked example in `/protocol/test-vectors/widgets.jsonl`. See [adding a widget](../contributing/adding-a-widget) for how these get built.
