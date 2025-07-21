import { sql } from 'bun';

const isTestEnv = process.env.NODE_ENV === 'test';

// PostgreSQL connection - Bun automatically uses DATABASE_URL or POSTGRES_URL
// Bun will automatically load .env.test when NODE_ENV=test

// Run migrations for test database on startup
if (isTestEnv) {
  const { migrate } = await import('../scripts/migrate');
  await migrate();
}

// Export the sql template literal for queries
export { sql };
export type DatabaseClient = typeof sql;
