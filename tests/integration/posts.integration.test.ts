import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'bun:test';

import { buildPostData } from '@tests/factories/post.factory';
import { buildUserData } from '@tests/factories/user.factory';
import { createTestServer, makeJsonRequest, type TestServer } from '@tests/helpers/server.helpers';
import '@tests/setup'; // This imports the setup hooks

describe('Posts API Integration Tests', () => {
  let server: TestServer;
  let authToken: string;
  let userData: any;

  beforeAll(async () => {
    server = createTestServer();
  });

  beforeEach(async () => {
    // Create a fresh user and get auth token before each test
    // This ensures the user exists after database cleanup
    userData = buildUserData();
    const signupResponse = await makeJsonRequest(
      server.baseUrl,
      '/api/auth/signup',
      'POST',
      userData
    );
    expect(signupResponse.status).toBe(201);

    const loginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
      email: userData.email,
      password: userData.password,
    });
    const loginData = (await loginResponse.json()) as any;
    authToken = loginData.token;
  });

  afterAll(() => {
    server.stop();
  });

  describe('POST /api/posts', () => {
    test('should create a new post with valid data and auth', async () => {
      const postData = buildPostData();

      const response = await makeJsonRequest(server.baseUrl, '/api/posts', 'POST', postData, {
        Authorization: `Bearer ${authToken}`,
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        title: postData.title,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    test('should return 401 when creating post without auth', async () => {
      const postData = buildPostData();

      const response = await makeJsonRequest(server.baseUrl, '/api/posts', 'POST', postData);
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authorization header required');
    });

    test('should return 401 with invalid token', async () => {
      const postData = buildPostData();

      const response = await makeJsonRequest(server.baseUrl, '/api/posts', 'POST', postData, {
        Authorization: 'Bearer invalid-token',
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Invalid or expired token');
    });

    test('should return 400 for missing title', async () => {
      const response = await makeJsonRequest(
        server.baseUrl,
        '/api/posts',
        'POST',
        {},
        {
          Authorization: `Bearer ${authToken}`,
        }
      );
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Title is required');
    });

    test('should return 400 for empty title', async () => {
      const response = await makeJsonRequest(
        server.baseUrl,
        '/api/posts',
        'POST',
        { title: '   ' },
        {
          Authorization: `Bearer ${authToken}`,
        }
      );
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Title is required');
    });

    test('should handle malformed JSON', async () => {
      const response = await fetch(`${server.baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: '{ invalid json',
      });

      const responseData = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid JSON format');
    });
  });

  describe('GET /api/posts/me', () => {
    test('should return user posts when authenticated', async () => {
      // Create a fresh user and token for this test
      const testUserData = buildUserData();
      const testSignupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        testUserData
      );
      const testSignupData = (await testSignupResponse.json()) as any;
      const testUserId = testSignupData.id;

      const testLoginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: testUserData.email,
        password: testUserData.password,
      });
      const testLoginData = (await testLoginResponse.json()) as any;
      const testAuthToken = testLoginData.token;

      // Create a couple of posts
      const post1 = buildPostData();
      const post2 = buildPostData();

      const createResponse1 = await makeJsonRequest(server.baseUrl, '/api/posts', 'POST', post1, {
        Authorization: `Bearer ${testAuthToken}`,
      });
      expect(createResponse1.status).toBe(201);

      const createResponse2 = await makeJsonRequest(server.baseUrl, '/api/posts', 'POST', post2, {
        Authorization: `Bearer ${testAuthToken}`,
      });
      expect(createResponse2.status).toBe(201);

      const response = await makeJsonRequest(server.baseUrl, '/api/posts/me', 'GET', undefined, {
        Authorization: `Bearer ${testAuthToken}`,
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBe(2);

      // Check post structure
      const post = responseData[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('updatedAt');
      expect(post).toHaveProperty('user');
      expect(post.user).toMatchObject({
        id: testUserId,
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    test('should return 401 when not authenticated', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/posts/me');
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authorization header required');
    });

    test('should return empty array if user has no posts', async () => {
      // Create a new user with no posts
      const newUserData = buildUserData();
      const signupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        newUserData
      );
      expect(signupResponse.status).toBe(201);

      const loginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: newUserData.email,
        password: newUserData.password,
      });
      const loginData = (await loginResponse.json()) as any;
      const newAuthToken = loginData.token;

      const response = await makeJsonRequest(server.baseUrl, '/api/posts/me', 'GET', undefined, {
        Authorization: `Bearer ${newAuthToken}`,
      });
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData).toHaveLength(0);
    });
  });

  describe('GET /api/posts', () => {
    test('should return all posts without authentication', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/posts');
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);

      if (responseData.length > 0) {
        const post = responseData[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('updatedAt');
        expect(post).toHaveProperty('user');
        expect(post.user).toHaveProperty('id');
        expect(post.user).toHaveProperty('name');
        expect(post.user).toHaveProperty('email');
      }
    });

    test('should include posts from all users', async () => {
      // Create two users and their posts
      const user1Data = buildUserData();
      const user1SignupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        user1Data
      );
      expect(user1SignupResponse.status).toBe(201);

      const user1LoginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: user1Data.email,
        password: user1Data.password,
      });
      const user1LoginData = (await user1LoginResponse.json()) as any;
      const user1AuthToken = user1LoginData.token;

      const user2Data = buildUserData();
      const user2SignupResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/auth/signup',
        'POST',
        user2Data
      );
      expect(user2SignupResponse.status).toBe(201);

      const user2LoginResponse = await makeJsonRequest(server.baseUrl, '/api/auth/login', 'POST', {
        email: user2Data.email,
        password: user2Data.password,
      });
      const user2LoginData = (await user2LoginResponse.json()) as any;
      const user2AuthToken = user2LoginData.token;

      // Create posts for each user
      const user1PostData = buildPostData();
      const user1PostResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/posts',
        'POST',
        user1PostData,
        {
          Authorization: `Bearer ${user1AuthToken}`,
        }
      );
      expect(user1PostResponse.status).toBe(201);

      const user2PostData = buildPostData();
      const user2PostResponse = await makeJsonRequest(
        server.baseUrl,
        '/api/posts',
        'POST',
        user2PostData,
        {
          Authorization: `Bearer ${user2AuthToken}`,
        }
      );
      expect(user2PostResponse.status).toBe(201);

      const response = await makeJsonRequest(server.baseUrl, '/api/posts');
      const responseData = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(responseData.length).toBeGreaterThanOrEqual(2);

      // Should have posts from different users
      const userIds = [...new Set(responseData.map((post: any) => post.user.id))];
      expect(userIds.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error Scenarios', () => {
    test('should return 404 for unknown posts routes', async () => {
      const response = await makeJsonRequest(server.baseUrl, '/api/posts/unknown');
      expect(response.status).toBe(404);
    });

    test('should handle unsupported methods on posts', async () => {
      const response = await fetch(`${server.baseUrl}/api/posts`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });

    test('should handle unsupported methods on posts/me', async () => {
      const response = await fetch(`${server.baseUrl}/api/posts/me`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });
});
