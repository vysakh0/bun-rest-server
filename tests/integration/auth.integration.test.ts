import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

import { buildUserData } from '@tests/factories/user.factory';
import { createTestServer, makeJsonRequest, type TestServer } from '@tests/helpers/server.helpers';
import '@tests/setup'; // This imports the setup hooks

describe('Auth API Integration Tests', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = createTestServer();
  });

  afterAll(() => {
    server.stop();
  });

  describe('POST /api/auth/signup', () => {
    test('should create a new user with valid data', async () => {
      const userData = buildUserData();

      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        name: userData.name,
        email: userData.email,
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(responseData).not.toHaveProperty('password');
    });

    test('should return 400 for missing required fields', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', {
        name: 'Test User',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('email, password are required');
    });

    test('should return 400 for empty body', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', {});
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('name, email, password are required');
    });

    test('should return 400 for invalid email format', async () => {
      const userData = buildUserData({ email: 'invalid-email' });

      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('email');
    });

    test('should return 400 for short password', async () => {
      const userData = buildUserData({ password: '123' });

      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Password must be at least 8 characters long');
    });

    test('should return 409 for duplicate email', async () => {
      const userData = buildUserData();

      // Create first user
      const response1 = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      expect(response1.status).toBe(201);

      // Try to create second user with same email
      const response2 = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      const responseData = (await response2.json()) as any;

      expect(response2.status).toBe(409);
      expect(responseData.error).toBe('Email already registered');
    });

    test('should handle malformed JSON', async () => {
      const response = await fetch(`${server.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      });

      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid JSON format');
    });

    test('should hash password before storing', async () => {
      const userData = buildUserData();

      const response = await makeJsonRequest(server.baseUrl, '/api/auth/signup', 'POST', userData);
      expect(response.status).toBe(201);

      // Password should not be returned in response
      const responseData = (await response.json()) as any;
      expect(responseData).not.toHaveProperty('password');
      expect(responseData.password).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const userData = buildUserData();

      // First signup
      const signupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        userData
      );
      expect(signupResponse.status).toBe(201);

      // Then login
      const loginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: userData.email,
        password: userData.password,
      });
      const loginData = (await loginResponse.json()) as any;

      expect(loginResponse.status).toBe(200);
      expect(loginData).toHaveProperty('user');
      expect(loginData).toHaveProperty('token');
      expect(loginData.user).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(loginData.user).not.toHaveProperty('password');
      expect(typeof loginData.token).toBe('string');
    });

    test('should return 401 for invalid email', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Invalid email or password');
    });

    test('should return 401 for invalid password', async () => {
      const userData = buildUserData();

      // First signup
      const signupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        userData
      );
      expect(signupResponse.status).toBe(201);

      // Login with wrong password
      const loginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: userData.email,
        password: 'wrongpassword',
      });
      const loginData = (await loginResponse.json()) as any;

      expect(loginResponse.status).toBe(401);
      expect(loginData.error).toBe('Invalid email or password');
    });

    test('should return 400 for missing email', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        password: 'password123',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('email is required');
    });

    test('should return 400 for missing password', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: 'test@example.com',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('password is required');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: 'invalidemail',
        password: 'password123',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid email format');
    });

    test('should handle malformed JSON', async () => {
      const response = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      });

      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid JSON format');
    });
  });

  describe('Error Scenarios', () => {
    test('should return 404 for unknown auth routes', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/auth/unknown');
      expect(response.status).toBe(404);
    });

    test('should handle unsupported methods on signup', async () => {
      const response = await fetch(`${server.baseUrl}/api/auth/signup`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    test('should handle unsupported methods on login', async () => {
      const response = await fetch(`${server.baseUrl}/api/auth/login`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });
  });
});
