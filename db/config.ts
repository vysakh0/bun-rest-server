import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import * as schema from './schema';

const isTestEnv = process.env.NODE_ENV === 'test';
const dbPath = isTestEnv ? ':memory:' : 'app.db';

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations for test database
if (isTestEnv) {
  migrate(db, { migrationsFolder: './db/migrations' });
}

export type DatabaseClient = typeof db;
