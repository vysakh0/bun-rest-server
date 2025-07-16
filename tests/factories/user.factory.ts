import type { InsertUser } from '@db/schema/users';

let userCounter = 0;

export const createUserData = (overrides?: Partial<InsertUser>): InsertUser => {
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
