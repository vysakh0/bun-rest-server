import { eq } from 'drizzle-orm';

import * as schema from '@db/schema';
import type { InsertUser } from '@db/schema/users';

import type { TestDatabase } from '@tests/helpers/db.helpers';

let userCounter = 0;

export const buildUserData = (overrides?: Partial<InsertUser>): InsertUser => {
  userCounter++;
  return {
    name: `Test User ${userCounter}`,
    email: `test${userCounter}@example.com`,
    password: 'password123',
    ...overrides,
  };
};

export const resetUserCounter = (): void => {
  userCounter = 0;
};

export const createUserInDb = async (
  db: TestDatabase,
  overrides?: Partial<InsertUser>
): Promise<any> => {
  const userData = buildUserData(overrides);
  const [user] = await db.insert(schema.users).values(userData).returning();
  return user;
};

export const createUsersInDb = async (
  db: TestDatabase,
  count: number,
  overrides?: Partial<InsertUser>
): Promise<any[]> => {
  const usersData = Array.from({ length: count }, () => buildUserData(overrides));
  const users = await db.insert(schema.users).values(usersData).returning();
  return users;
};

export const getAllUsers = async (db: TestDatabase): Promise<any[]> => {
  return await db.select().from(schema.users);
};

export const getUserByEmail = async (db: TestDatabase, email: string): Promise<any | null> => {
  const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
  return users[0] || null;
};
