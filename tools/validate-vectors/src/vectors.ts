import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { VECTORS_DIR } from './schemas.js';
import type { TestVector } from './types.js';

export function vectorFiles(): string[] {
  return readdirSync(VECTORS_DIR)
    .filter((f) => f.endsWith('.jsonl'))
    .sort();
}

export function loadVectorFile(file: string): TestVector[] {
  const text = readFileSync(path.join(VECTORS_DIR, file), 'utf8');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l) as TestVector);
}
