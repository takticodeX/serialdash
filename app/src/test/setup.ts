// jsdom (the Vitest test environment) has no IndexedDB implementation — shim it so
// storage/db.ts works the same under test as it does in a real browser.
import 'fake-indexeddb/auto';
