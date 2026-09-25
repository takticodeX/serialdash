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

// SPEC.md §4: only the P0 display widgets are implemented as of M2 (line/value/gauge/led/log) —
// P1 (xy, bar, pie, level, table, heat, plus the control widgets) arrive in M5, P2 later still.
// This list grows as each widget actually ships, rather than documenting ones that don't exist.
const P0_KINDS = ['line', 'value', 'gauge', 'led', 'log'] as const;

// SPEC.md §4.1/§4.3 "Valore" column — small enough, and stable enough, to just state directly
// rather than trying to derive English prose from the JSON Schema's value-shape union.
const VALUE_FORMS: Record<string, string> = {
  line: 'One number per channel.',
  value: 'A number or a string.',
  gauge: 'A number.',
  led: 'A boolean, number, or string.',
  log: '`e` events — does not use `ch`.',
};

// Adapted from the worked examples in SPEC.md §3.7/§4.2.
const EXAMPLES: Record<string, string> = {
  line: '@{"t":"w","id":"acc","k":"line","title":"Accelerometer","ch":["ax","ay","az"],"labels":["X","Y","Z"],"unit":"g","min":-2,"max":2,"win":10}',
  value: '@{"t":"w","id":"hum","k":"value","ch":"h","unit":"%","trend":true}',
  gauge:
    '@{"t":"w","id":"g1","k":"gauge","ch":"h","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}',
  led: '@{"t":"w","id":"stato","k":"led","ch":"st","states":{"0":["Stopped","#888888"],"1":["Running","#2ecc71"]}}',
  log: '@{"t":"w","id":"evt","k":"log","lvl":"warn","max":200}',
};

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
  return [
    '## Arduino library example',
    '',
    `Arrives with the library (M3) — the builder method for \`k: "${kind}"\`, and a runnable example sketch.`,
    '',
    '## Compatible templates for switching type',
    '',
    'Arrives with dashboard overrides (M5, APP-DSH-05).',
    '',
  ].join('\n');
}

async function genWidgetPage(kind: string): Promise<void> {
  const [schema, strings] = await Promise.all([loadWidgetSchema(kind), loadWidgetStrings(kind)]);
  const { properties, required } = flattenProperties(schema);

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
    await writeFormatted(outFile, header + generated + '\n\n' + pageTrailer(kind));
  }
}

async function genWidgetsIndex(): Promise<void> {
  const rows = await Promise.all(
    P0_KINDS.map(async (kind) => {
      const strings = await loadWidgetStrings(kind);
      return `- [${strings.name}](./${kind}) (\`${kind}\`) — ${strings.description}`;
    }),
  );

  const generated = ['<!-- generated:start -->', '', ...rows, ''].join('\n');
  const outFile = path.join(OUT_DIR, 'index.md');
  const existing = await readFile(outFile, 'utf8');
  if (!MARKER_RE.test(existing)) {
    throw new Error(`${outFile} is missing <!-- generated:start/end --> markers`);
  }
  await writeFormatted(outFile, existing.replace(MARKER_RE, generated + '<!-- generated:end -->'));
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const kind of P0_KINDS) await genWidgetPage(kind);
  await genWidgetsIndex();
  console.log(`gen-docs: wrote docs/widgets/{${P0_KINDS.join(',')},index}.md`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
