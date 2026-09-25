import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface SerialDashDB extends DBSchema {
  kv: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<SerialDashDB>> | undefined;

function getDb(): Promise<IDBPDatabase<SerialDashDB>> {
  dbPromise ??= openDB<SerialDashDB>('serialdash', 1, {
    upgrade(db) {
      db.createObjectStore('kv');
    },
  });
  return dbPromise;
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return (await db.get('kv', key)) as T | undefined;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  await db.put('kv', value, key);
}

/** APP-DSH settings reset / "cancella tutti i dati locali" (§5.8). */
export async function kvClearAll(): Promise<void> {
  const db = await getDb();
  await db.clear('kv');
}
