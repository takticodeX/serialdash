/** Shape of one line in /protocol/test-vectors/*.jsonl (PRO-03). */
export interface TestVector {
  name: string;
  dir: 'd2a' | 'a2d';
  /** The raw protocol line, including the leading `@`. */
  line: string;
  valid: boolean;
  expect: unknown;
  error?: string;
  note?: string;
}
