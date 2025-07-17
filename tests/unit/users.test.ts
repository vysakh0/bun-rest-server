import { describe, test, expect, mock } from 'bun:test';

import * as schema from '@db/schema';

import { buildUserData, createUserInDb } from '@tests/factories/user.factory';
import { db } from '@tests/setup';

describe('User Route Handlers', () => {
  const createUserHandler = (database: any) => async (req: Request) => {
    try {
      const body = (await req.json()) as { name?: string; email?: string; password?: string };
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const [newUser] = await database
        .insert(schema.users)
        .values({ name, email, password })
        .returning();

      return new Response(JSON.stringify(newUser), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  const listUsersHandler = (database: any) => async () => {
    try {
      const allUsers = await database.select().from(schema.users);

      return new Response(JSON.stringify(allUsers), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  describe('createUser', () => {
    test('should create a user with valid data', async () => {
      const createUser = createUserHandler(db);
      const userData = buildUserData();
      const mockReq = {
        json: mock(() => Promise.resolve(userData)),
      };

      const response = await createUser(mockReq as any);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    test('should return 400 when name is missing', async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.resolve({ email: 'test@example.com', password: 'password123' })),
      };

      const response = await createUser(mockReq as any);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Name, email, and password are required');
    });

    test('should return 400 when email is missing', async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.resolve({ name: 'Test User', password: 'password123' })),
      };

      const response = await createUser(mockReq as any);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Name, email, and password are required');
    });

    test('should handle JSON parsing errors', async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.reject(new Error('Invalid JSON'))),
      };

      const response = await createUser(mockReq as any);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Invalid JSON');
    });

    test('should handle duplicate email errors', async () => {
      const createUser = createUserHandler(db);
      const userData = buildUserData();

      await createUserInDb(db, userData);

      const mockReq = {
        json: mock(() => Promise.resolve(userData)),
      };

      const response = await createUser(mockReq as any);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(responseData.error).toContain('UNIQUE constraint failed');
    });
  });

  describe('listUsers', () => {
    test('should return empty array when no users exist', async () => {
      const listUsers = listUsersHandler(db);
      const response = await listUsers();
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseData).toEqual([]);
    });

    test('should return all users', async () => {
      const listUsers = listUsersHandler(db);
      const userData1 = buildUserData();
      const userData2 = buildUserData();

      await createUserInDb(db, userData1);
      await createUserInDb(db, userData2);

      const response = await listUsers();
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toMatchObject({
        name: userData1.name,
        email: userData1.email,
      });
      expect(responseData[1]).toMatchObject({
        name: userData2.name,
        email: userData2.email,
      });
    });
  });
});
