import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database('app.db');
export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
