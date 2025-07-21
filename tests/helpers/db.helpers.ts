import { sql } from '@db/config';

export const cleanDatabase = async (): Promise<void> => {
  // Clean tables in the correct order due to foreign key constraints
  await sql`TRUNCATE TABLE posts CASCADE`;
  await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`;
  // Don't clean migrations table - we want those to persist
};
