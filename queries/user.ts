import { eq, type SQL } from 'drizzle-orm';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';

import { db } from '@db/config';
import { users, type InsertUser, type User } from '@db/schema';

// Generic find function that can be reused
const findOne = async <T>(
  table: SQLiteTableWithColumns<any>,
  where: SQL
): Promise<T | undefined> => {
  const result = await db.select().from(table).where(where).limit(1);
  return result[0] as T;
};

// User-specific queries
export const userQueries = {
  findByEmail: (email: string) => findOne<User>(users, eq(users.email, email)),

  findById: (id: number) => findOne<User>(users, eq(users.id, id)),

  findAll: () => db.select().from(users),

  create: (data: InsertUser) => db.insert(users).values(data),

  update: (id: number, data: Partial<InsertUser>) =>
    db.update(users).set(data).where(eq(users.id, id)),

  delete: (id: number) => db.delete(users).where(eq(users.id, id)),
};
