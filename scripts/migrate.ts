import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { sql } from 'bun';

const MIGRATIONS_TABLE = 'migrations';

// Create migrations table if it doesn't exist
const createMigrationsTable = async (): Promise<void> => {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(MIGRATIONS_TABLE)} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
};

// Get list of applied migrations
const getAppliedMigrations = async (): Promise<string[]> => {
  const rows = await sql`
    SELECT filename FROM ${sql(MIGRATIONS_TABLE)} ORDER BY filename
  `;
  return rows.map((row) => row.filename);
};

// Apply a single migration
const applyMigration = async (filename: string, content: string): Promise<void> => {
  console.log(`Applying migration: ${filename}`);

  try {
    // Start transaction
    await sql.begin(async (tx) => {
      // Execute migration SQL
      await tx.unsafe(content);

      // Record migration as applied
      await tx`
        INSERT INTO ${sql(MIGRATIONS_TABLE)} (filename) 
        VALUES (${filename})
      `;
    });

    console.log(`✓ Applied: ${filename}`);
  } catch (error) {
    console.error(`✗ Failed to apply ${filename}:`, error);
    throw error;
  }
};

// Run all pending migrations
export const migrate = async (): Promise<void> => {
  console.log('Running migrations...');

  // Create migrations table
  await createMigrationsTable();

  // Get applied migrations
  const applied = await getAppliedMigrations();
  const appliedSet = new Set(applied);

  // Read migration files
  const migrationsDir = join(import.meta.dir, '..', 'db', 'migrations');
  const files = await readdir(migrationsDir);
  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

  // Apply pending migrations
  let migrationsRun = 0;
  for (const file of sqlFiles) {
    if (!appliedSet.has(file)) {
      const content = await Bun.file(join(migrationsDir, file)).text();
      await applyMigration(file, content);
      migrationsRun++;
    }
  }

  if (migrationsRun === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Applied ${migrationsRun} migration(s).`);
  }
};

// CLI support
if (import.meta.main) {
  await migrate();
  process.exit(0);
}
