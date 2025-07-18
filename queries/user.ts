import { eq } from 'drizzle-orm';

import { findOne } from '@utils/database';

import { db } from '@db/config';
import { users, type InsertUser, type User } from '@db/schema';

export const userQueries = {
  findByEmail: (email: string) => findOne<User>(users, eq(users.email, email)),

  findById: (id: number) => findOne<User>(users, eq(users.id, id)),

  findAll: () => db.select().from(users),

  create: (data: InsertUser) => db.insert(users).values(data),

  update: (id: number, data: Partial<InsertUser>) =>
    db.update(users).set(data).where(eq(users.id, id)),

  delete: (id: number) => db.delete(users).where(eq(users.id, id)),
};
