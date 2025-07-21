import { sql } from '@db/config';

import type { InsertUser, User } from '@type/users';

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

export const createUserInDb = async (overrides?: Partial<InsertUser>): Promise<User> => {
  const userData = buildUserData(overrides);
  const [user] = await sql<User[]>`
    INSERT INTO users (name, email, password)
    VALUES (${userData.name}, ${userData.email}, ${userData.password})
    RETURNING *
  `;
  return user;
};

export const createUsersInDb = async (
  count: number,
  overrides?: Partial<InsertUser>
): Promise<User[]> => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createUserInDb(overrides);
    users.push(user);
  }
  return users;
};

export const getAllUsers = async (): Promise<User[]> => {
  return sql<User[]>`SELECT * FROM users ORDER BY id`;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await sql<User[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return users[0] || null;
};
