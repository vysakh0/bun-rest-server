import { join } from 'node:path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name: bun run db:create-migration <name>');
  process.exit(1);
}

// Generate timestamp-based filename
const timestamp = new Date()
  .toISOString()
  .replace(/[-:T.]/g, '')
  .slice(0, 14);
const filename = `${timestamp}_${migrationName}.sql`;
const filepath = join(import.meta.dir, '..', 'db', 'migrations', filename);

// Create empty migration file
await Bun.write(
  filepath,
  `-- Migration: ${migrationName}\n-- Created at: ${new Date().toISOString()}\n\n`
);

console.log(`Created migration: ${filename}`);
console.log(`Edit the file at: ${filepath}`);
