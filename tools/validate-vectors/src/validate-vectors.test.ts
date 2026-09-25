import { describe, expect, it } from 'vitest';
import { getValidator } from './schemas.js';
import { loadVectorFile, vectorFiles } from './vectors.js';

describe('PRO-03 protocol test vectors validate against /protocol/schema (M0 acceptance criterion)', () => {
  for (const file of vectorFiles()) {
    describe(file, () => {
      for (const vector of loadVectorFile(file)) {
        it(vector.name, () => {
          if (!vector.line.startsWith('@{')) {
            // PRT-02/PRT-03: a line not starting with '@{' is not a protocol message at all
            // (free text for the console), so it can never validate against the message schema.
            expect(vector.valid).toBe(false);
            return;
          }
          const payload = vector.line.slice(1);

          let parsed: unknown;
          try {
            parsed = JSON.parse(payload);
          } catch {
            expect(vector.valid).toBe(false);
            return;
          }

          const validate = getValidator(vector.dir);
          const ok = validate(parsed);

          if (ok !== vector.valid) {
            throw new Error(
              `${vector.name}: expected valid=${vector.valid}, got ${ok}. ` +
                `Ajv errors: ${JSON.stringify(validate.errors)}`,
            );
          }

          if (vector.valid) {
            expect(parsed).toEqual(vector.expect);
          }
        });
      }
    });
  }
});
