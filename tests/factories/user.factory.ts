import type { InsertUser } from "../../db/schema/users";

let userCounter = 0;

export function createUserData(overrides?: Partial<InsertUser>): InsertUser {
  userCounter++;
  return {
    name: `Test User ${userCounter}`,
    email: `test${userCounter}@example.com`,
    ...overrides
  };
}

export function resetUserCounter() {
  userCounter = 0;
}