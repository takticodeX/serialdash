import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import * as prettier from 'prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const WIDGETS_SCHEMA_DIR = path.join(REPO_ROOT, 'protocol', 'schema', 'widgets');
const EN_LOCALE_FILE = path.join(REPO_ROOT, 'app', 'src', 'i18n', 'locales', 'en.json');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'widgets');

// SPEC.md §4: every widget kind the app currently has a component for (registered in
// app/src/widgets/index.ts) — the 5 P0 display kinds plus the 13 P1 kinds that shipped in M5.
// hist/polar/compass/attitude aren't here: the library can declare them, but the app has no
// widget component for them yet (M8+). This list grows as each widget actually ships, rather
// than documenting ones that don't exist.
const IMPLEMENTED_KINDS = [
  'line',
  'value',
  'gauge',
  'led',
  'log',
  'xy',
  'bar',
  'pie',
  'level',
  'table',
  'heat',
  'button',
  'switch',
  'slider',
  'number',
  'select',
  'text',
  'color',
] as const;

// SPEC.md §4.1/§4.3 "Valore" column — small enough, and stable enough, to just state directly
// rather than trying to derive English prose from the JSON Schema's value-shape union.
const VALUE_FORMS: Record<string, string> = {
  line: 'One number per channel.',
  value: 'A number or a string.',
  gauge: 'A number.',
  led: 'A boolean, number, or string.',
  log: '`e` events — does not use `ch`.',
  xy: 'An `[x, y]` pair.',
  bar: 'One number per channel, a label→number object, or a flat array of numbers.',
  pie: 'A label→number object.',
  level: 'A number.',
  table: 'A label→value object, or one value per channel (multi-`ch`).',
  heat: 'A flat array of `rows` × `cols` numbers, row-major.',
  button: 'Sends `true` (or `true`/`false` on press/release, with `hold`).',
  switch: 'A boolean.',
  slider: 'A number.',
  number: 'A number.',
  select: 'A string, matching one of `opts`.',
  text: 'A string.',
  color: 'A `#RRGGBB` string.',
};

// Adapted from the worked examples in SPEC.md §3.7/§4.2, and from each widget's own demo example
// (app/src/widgets/<kind>/*.tsx) for the ones added since.
const EXAMPLES: Record<string, string> = {
  line: '@{"t":"w","id":"acc","k":"line","title":"Accelerometer","ch":["ax","ay","az"],"labels":["X","Y","Z"],"unit":"g","min":-2,"max":2,"win":10}',
  value: '@{"t":"w","id":"hum","k":"value","ch":"h","unit":"%","trend":true}',
  gauge:
    '@{"t":"w","id":"g1","k":"gauge","ch":"h","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}',
  led: '@{"t":"w","id":"stato","k":"led","ch":"st","states":{"0":["Stopped","#888888"],"1":["Running","#2ecc71"]}}',
  log: '@{"t":"w","id":"evt","k":"log","lvl":"warn","max":200}',
  xy: '@{"t":"w","id":"pos","k":"xy","ch":"p","xmin":-1.2,"xmax":1.2,"ymin":-1.2,"ymax":1.2,"mode":"lines"}',
  bar: '@{"t":"w","id":"spec","k":"bar","ch":"s","min":0,"max":100}',
  pie: '@{"t":"w","id":"pwr","k":"pie","ch":"p","donut":true}',
  level:
    '@{"t":"w","id":"tank","k":"level","ch":"lvl","min":0,"max":100,"unit":"%","zones":[[0,20,"#e74c3c"],[20,100,"#2ecc71"]]}',
  table: '@{"t":"w","id":"status","k":"table","ch":"st"}',
  heat: '@{"t":"w","id":"grid","k":"heat","ch":"g","rows":4,"cols":4,"min":15,"max":35,"palette":"thermal"}',
  button: '@{"t":"w","id":"reboot","k":"button","confirm":"Are you sure?"}',
  switch: '@{"t":"w","id":"fan","k":"switch","val":false}',
  slider: '@{"t":"w","id":"pwm","k":"slider","min":0,"max":255,"val":0}',
  number: '@{"t":"w","id":"setpoint","k":"number","min":-10,"max":50,"val":21}',
  select: '@{"t":"w","id":"mode","k":"select","opts":["auto","manual"],"val":"auto"}',
  text: '@{"t":"w","id":"label","k":"text","max":24,"val":"Device"}',
  color:
    '@{"t":"w","id":"ledColor","k":"color","swatches":["#ff0000","#00ff00","#0000ff"],"val":"#ff0000"}',
};

// LIB-TX-01: the C++ factory method name, when it isn't just the kind string — Arduino's AVR core
// #defines `switch` as a keyword (it's not, but `toggle()` was chosen to read better regardless).
const LIBRARY_METHOD_NAMES: Record<string, string> = { switch: 'toggle' };

// APP-DSH-05 (templateCompatibility.ts) — kept in sync by hand since it's a short, stable list,
// not derived from the schema (nothing in the schema itself expresses "compatible value shape").
const NUMERIC_SWITCHABLE_KINDS = ['line', 'value', 'gauge', 'level'];

const CONTROL_KINDS = new Set(['button', 'switch', 'slider', 'number', 'select', 'text', 'color']);

interface JsonSchemaNode {
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  allOf?: JsonSchemaNode[];
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  items?: JsonSchemaNode;
  description?: string;
  [key: string]: unknown;
}

function flattenProperties(schema: JsonSchemaNode): {
  properties: Record<string, JsonSchemaNode>;
  required: Set<string>;
} {
  const properties: Record<string, JsonSchemaNode> = {};
  const required = new Set<string>();

  function visit(node: JsonSchemaNode | undefined): void {
    if (!node) return;
    if (node.properties) Object.assign(properties, node.properties);
    if (node.required) for (const r of node.required) required.add(r);
    if (node.allOf) for (const sub of node.allOf) visit(sub);
  }
  visit(schema);

  return { properties, required };
}

function describeType(schema: JsonSchemaNode): string {
  if (schema.const !== undefined) return `\`${JSON.stringify(schema.const)}\``;
  if (schema.enum) return schema.enum.map((v) => `\`${JSON.stringify(v)}\``).join(' \\| ');
  if (Array.isArray(schema.type)) return schema.type.join(' \\| ');
  if (schema.type === 'array') return `${describeType(schema.items ?? {})}[]`;
  return schema.type ?? 'any';
}

async function loadWidgetSchema(kind: string): Promise<JsonSchemaNode> {
  const file = path.join(WIDGETS_SCHEMA_DIR, `${kind}.schema.json`);
  return (await $RefParser.dereference(file)) as JsonSchemaNode;
}

interface WidgetStrings {
  name: string;
  description: string;
}

async function loadWidgetStrings(kind: string): Promise<WidgetStrings> {
  const locale = JSON.parse(await readFile(EN_LOCALE_FILE, 'utf8')) as {
    widgets: Record<string, WidgetStrings>;
  };
  const strings = locale.widgets[kind];
  if (!strings) throw new Error(`missing widgets.${kind} in app/src/i18n/locales/en.json`);
  return strings;
}

// common.schema.json's widgetBase — every widget has these; the page states that once and lists
// only kind-specific properties in the table (checked against widget-base's own field list, not
// hardcoded here twice).
const COMMON_PROPERTY_NAMES = new Set([
  't',
  'k',
  'id',
  'title',
  'ch',
  'grp',
  'ord',
  'size',
  'unit',
  'dec',
  'labels',
  'colors',
  'stale',
]);

function propertyTable(properties: Record<string, JsonSchemaNode>, required: Set<string>): string {
  const rows = Object.entries(properties)
    .filter(([name]) => !COMMON_PROPERTY_NAMES.has(name))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, schema]) => {
      const req = required.has(name) ? '**yes**' : 'no';
      const desc = schema.description ?? '';
      return `| \`${name}\` | ${describeType(schema)} | ${req} | ${desc} |`;
    });
  return ['| Property | Type | Required | Description |', '|---|---|---|---|', ...rows].join('\n');
}

async function writeFormatted(filePath: string, content: string): Promise<void> {
  const config = (await prettier.resolveConfig(filePath)) ?? {};
  const formatted = await prettier.format(content, { ...config, filepath: filePath });
  await writeFile(filePath, formatted);
}

const MARKER_RE = /<!-- generated:start -->[\s\S]*?<!-- generated:end -->/;

function pageTrailer(kind: string): string {
  const method = LIBRARY_METHOD_NAMES[kind] ?? kind;
  const compatible = NUMERIC_SWITCHABLE_KINDS.includes(kind)
    ? NUMERIC_SWITCHABLE_KINDS.filter((k) => k !== kind)
    : [];

  return [
    '## Arduino library',
    '',
    `\`dash.${method}(id, title)\` — see the [library reference](../library/api) for the full chainable property list, and \`lib/SerialDash/examples/\` for a runnable sketch using it.`,
    '',
    '## Compatible templates for switching type',
    '',
    compatible.length > 0
      ? `From the widget's settings panel (APP-DSH-05), this widget can be switched to: ${compatible.map((k) => `\`${k}\``).join(', ')} — same value shape, no firmware change needed.`
      : CONTROL_KINDS.has(kind)
        ? "Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (PRT-13), so changing kind would change what the device needs to recognize."
        : "No other kind shares this one's value shape, so there's nothing to switch it to.",
    '',
  ].join('\n');
}

async function genWidgetPage(kind: string): Promise<void> {
  const [schema, strings] = await Promise.all([loadWidgetSchema(kind), loadWidgetStrings(kind)]);
  const { properties, required } = flattenProperties(schema);

  // The trailer (library method + compatible-kinds list) is fully derived from data, same as
  // everything else here — it lives inside the generated block (not appended once on first
  // creation) so a later regen can't leave it stale, the way a stray "arrives in M3" note once
  // did after M3 actually shipped.
  const generated = [
    '<!-- generated:start -->',
    '',
    strings.description,
    '',
    `**Value:** ${VALUE_FORMS[kind] ?? '—'}`,
    '',
    '## Properties',
    '',
    `Common properties every widget has (\`id\`, \`title\`, \`ch\`, \`grp\`, \`ord\`, \`size\`, \`unit\`, \`dec\`, \`labels\`, \`colors\`, \`stale\`) are documented once in [the message reference](../protocol/messages) — only \`${kind}\`-specific properties are listed below.`,
    '',
    propertyTable(properties, required),
    '',
    '## Example',
    '',
    '```json',
    EXAMPLES[kind] ?? '',
    '```',
    '',
    pageTrailer(kind),
    '<!-- generated:end -->',
  ].join('\n');

  const outFile = path.join(OUT_DIR, `${kind}.md`);
  let existing: string;
  try {
    existing = await readFile(outFile, 'utf8');
  } catch {
    existing = null as unknown as string;
  }

  if (existing && MARKER_RE.test(existing)) {
    await writeFormatted(outFile, existing.replace(MARKER_RE, generated));
  } else {
    const header = `# ${strings.name}\n\n`;
    await writeFormatted(outFile, header + generated);
  }
}

async function genWidgetsIndex(): Promise<void> {
  const displayKinds = IMPLEMENTED_KINDS.filter((k) => !CONTROL_KINDS.has(k));
  const controlKinds = IMPLEMENTED_KINDS.filter((k) => CONTROL_KINDS.has(k));

  async function rowsFor(kinds: readonly string[]): Promise<string[]> {
    return Promise.all(
      kinds.map(async (kind) => {
        const strings = await loadWidgetStrings(kind);
        return `- [${strings.name}](./${kind}) (\`${kind}\`) — ${strings.description}`;
      }),
    );
  }

  const generated = [
    '<!-- generated:start -->',
    '',
    '## Display',
    '',
    ...(await rowsFor(displayKinds)),
    '',
    '## Controls',
    '',
    ...(await rowsFor(controlKinds)),
    '',
  ].join('\n');
  const outFile = path.join(OUT_DIR, 'index.md');
  const existing = await readFile(outFile, 'utf8');
  if (!MARKER_RE.test(existing)) {
    throw new Error(`${outFile} is missing <!-- generated:start/end --> markers`);
  }
  await writeFormatted(outFile, existing.replace(MARKER_RE, generated + '<!-- generated:end -->'));
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const kind of IMPLEMENTED_KINDS) await genWidgetPage(kind);
  await genWidgetsIndex();
  console.log(`gen-docs: wrote docs/widgets/{${IMPLEMENTED_KINDS.join(',')},index}.md`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
