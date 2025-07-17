import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import * as schema from '@db/schema';

export type TestDatabase = ReturnType<typeof drizzle>;

export const createTestDatabase = (): { db: TestDatabase; testDb: Database } => {
  const testDb = new Database(':memory:');
  const db = drizzle(testDb, { schema });

  migrate(db, { migrationsFolder: './db/migrations' });

  return { db, testDb };
};

export const cleanDatabase = async (db: TestDatabase): Promise<void> => {
  await db.delete(schema.users);
};
