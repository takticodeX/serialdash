import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
export const SCHEMA_DIR = path.join(REPO_ROOT, 'protocol', 'schema');
export const VECTORS_DIR = path.join(REPO_ROOT, 'protocol', 'test-vectors');

const SCHEMA_IDS = {
  d2a: 'https://schema.serialdash.dev/v1/device-to-app.schema.json',
  a2d: 'https://schema.serialdash.dev/v1/app-to-device.schema.json',
} as const;

function loadJson(file: string): object {
  return JSON.parse(readFileSync(file, 'utf8')) as object;
}

let ajv: Ajv2020 | undefined;

function getAjv(): Ajv2020 {
  if (ajv) return ajv;

  ajv = new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true });

  const widgetsDir = path.join(SCHEMA_DIR, 'widgets');
  for (const file of readdirSync(widgetsDir)) {
    if (file.endsWith('.schema.json')) {
      ajv.addSchema(loadJson(path.join(widgetsDir, file)));
    }
  }
  ajv.addSchema(loadJson(path.join(SCHEMA_DIR, 'device-to-app.schema.json')));
  ajv.addSchema(loadJson(path.join(SCHEMA_DIR, 'app-to-device.schema.json')));

  return ajv;
}

export function getValidator(dir: 'd2a' | 'a2d'): ValidateFunction {
  const validate = getAjv().getSchema(SCHEMA_IDS[dir]);
  if (!validate) throw new Error(`schema not registered: ${SCHEMA_IDS[dir]}`);
  return validate;
}
