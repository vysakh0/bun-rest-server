import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

import { buildUserData } from '@tests/factories/user.factory';
import { createTestServer, makeJsonRequest, type TestServer } from '@tests/helpers/server.helpers';
import '@tests/setup'; // This imports the setup hooks

describe('User API Integration Tests', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = createTestServer();
  });

  afterAll(() => {
    server.stop();
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const userData = buildUserData();

      const response = await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        name: userData.name,
        email: userData.email,
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    test('should return 400 for invalid data', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/users', 'POST', {
        name: 'Test User',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('email, password are required');
    });

    test('should return 400 for empty body', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/users', 'POST', {});
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('name, email, password are required');
    });

    test('should handle malformed JSON', async () => {
      const response = await fetch(`${server.baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      });

      const responseData = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to parse JSON');
    });

    test('should enforce unique email constraint', async () => {
      const userData = buildUserData();

      const response1 = await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData);
      expect(response1.status).toBe(201);

      const response2 = await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData);
      const responseData = (await response2.json()) as any;

      expect(response2.status).toBe(500);
      expect(responseData.error).toContain('UNIQUE constraint failed');
    });
  });

  describe('GET /api/users', () => {
    test('should return empty array initially', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/users');
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData).toHaveLength(0);
    });

    test('should return all created users', async () => {
      const userData1 = buildUserData();
      const userData2 = buildUserData();

      await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData1);
      await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData2);

      const response = await makeJsonRequest(server.baseUrl, '/api/users');
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseData).toHaveLength(2);

      const emails = responseData.map((user: any) => user.email);
      expect(emails).toContain(userData1.email);
      expect(emails).toContain(userData2.email);
    });

    test('should return proper user objects', async () => {
      const userData = buildUserData();

      await makeJsonRequest(server.baseUrl, '/api/users', 'POST', userData);

      const response = await makeJsonRequest(server.baseUrl, '/api/users');
      const responseData = (await response.json()) as any;
      const user = responseData.find((u: any) => u.email === userData.email);

      expect(user).toBeDefined();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });
  });

  describe('Error Scenarios', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/unknown');
      expect(response.status).toBe(404);
    });

    test('should handle unsupported methods', async () => {
      const response = await fetch(`${server.baseUrl}/api/users`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });
});
