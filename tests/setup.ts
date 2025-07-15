import { beforeAll, afterAll, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "../db/schema";

let testDb: Database;
export let db: ReturnType<typeof drizzle>;

beforeAll(() => {
  testDb = new Database(":memory:");
  db = drizzle(testDb, { schema });
  
  migrate(db, { migrationsFolder: "./db/migrations" });
});

beforeEach(async () => {
  await db.delete(schema.users);
});

afterAll(() => {
  testDb.close();
});

export { schema };