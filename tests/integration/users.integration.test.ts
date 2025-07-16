import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { createUserData, resetUserCounter } from "@tests/factories/user.factory";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "@db/schema";
import type { Server } from "bun";

describe("User API Integration Tests", () => {
  let server: Server;
  let testDb: Database;
  let db: ReturnType<typeof drizzle>;
  const baseUrl = "http://localhost:3002";

  beforeAll(async () => {
    resetUserCounter();
    
    testDb = new Database(":memory:");
    db = drizzle(testDb, { schema });
    migrate(db, { migrationsFolder: "./db/migrations" });
    
    const { createUser, listUsers } = await import("../../routes/users");
    
    const createUserWithTestDb = async (req: Request) => {
      try {
        const body = await req.json() as { name?: string; email?: string; password?: string };
        const { name, email, password } = body;

        if (!name || !email || !password) {
          return new Response(
            JSON.stringify({ error: "Name, email, and password are required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const [newUser] = await db
          .insert(schema.users)
          .values({ name, email, password })
          .returning();

        return new Response(JSON.stringify(newUser), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    };

    const listUsersWithTestDb = async () => {
      try {
        const allUsers = await db.select().from(schema.users);
        
        return new Response(JSON.stringify(allUsers), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    };
    
    const routes = {
      "/api/users": {
        GET: listUsersWithTestDb,
        POST: createUserWithTestDb,
      },
    };
    
    server = Bun.serve({
      port: 3002,
      routes,
      development: false
    });
  });

  beforeEach(async () => {
    await db.delete(schema.users);
  });

  afterAll(() => {
    server.stop();
    testDb.close();
  });

  describe("POST /api/users", () => {
    test("should create a new user", async () => {
      const userData = createUserData();
      
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        name: userData.name,
        email: userData.email,
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test("should return 400 for invalid data", async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User" })
      });

      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Name, email, and password are required");
    });

    test("should return 400 for empty body", async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Name, email, and password are required");
    });

    test("should handle malformed JSON", async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json"
      });

      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Failed to parse JSON");
    });

    test("should enforce unique email constraint", async () => {
      const userData = createUserData();
      
      const response1 = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      
      expect(response1.status).toBe(201);
      
      const response2 = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const responseData = await response2.json();

      expect(response2.status).toBe(500);
      expect(responseData.error).toContain("UNIQUE constraint failed");
    });
  });

  describe("GET /api/users", () => {
    test("should return empty array initially", async () => {
      const response = await fetch(`${baseUrl}/api/users`);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData).toHaveLength(0);
    });

    test("should return all created users", async () => {
      const userData1 = createUserData();
      const userData2 = createUserData();
      
      await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData1)
      });
      
      await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData2)
      });

      const response = await fetch(`${baseUrl}/api/users`);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toHaveLength(2);
      
      const emails = responseData.map((user: any) => user.email);
      expect(emails).toContain(userData1.email);
      expect(emails).toContain(userData2.email);
    });

    test("should return proper user objects", async () => {
      const userData = createUserData();
      
      await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const response = await fetch(`${baseUrl}/api/users`);
      const responseData = await response.json();
      const user = responseData.find((u: any) => u.email === userData.email);

      expect(user).toBeDefined();
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");
    });
  });

  describe("Error Scenarios", () => {
    test("should return 404 for unknown routes", async () => {
      const response = await fetch(`${baseUrl}/api/unknown`);
      
      expect(response.status).toBe(404);
    });

    test("should handle unsupported methods", async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "DELETE"
      });
      
      expect(response.status).toBe(404);
    });
  });
});