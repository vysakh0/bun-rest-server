#!/usr/bin/env bun
import { URL } from 'url';

import { spawn } from 'bun';

// Extract database name from DATABASE_URL
const getDatabaseFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.slice(1); // Remove leading slash
  } catch {
    throw new Error(`Invalid DATABASE_URL: ${url}`);
  }
};

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const dbName = getDatabaseFromUrl(databaseUrl);

try {
  console.log(`🗑️  Dropping database: ${dbName}`);
  await Bun.$`dropdb --if-exists ${dbName}`.quiet();

  console.log(`📦 Creating database: ${dbName}`);
  const proc = spawn(['createdb', dbName]);
  const result = await proc.exited;

  if (result !== 0) {
    console.error(`❌ Failed to create database: ${dbName}`);
    process.exit(1);
  }

  console.log(`✅ Database recreated successfully: ${dbName}`);
} catch (error) {
  console.error('❌ Error during database recreation:', error);
  process.exit(1);
}
