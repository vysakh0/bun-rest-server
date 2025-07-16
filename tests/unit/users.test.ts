import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { createUserData } from "@tests/factories/user.factory";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "@db/schema";

describe("User Route Handlers", () => {
  let testDb: Database;
  let db: ReturnType<typeof drizzle>;
  
  beforeEach(() => {
    testDb = new Database(":memory:");
    db = drizzle(testDb, { schema });
    migrate(db, { migrationsFolder: "./db/migrations" });
  });

  afterEach(() => {
    testDb.close();
  });

  const createUserHandler = (database: any) => async (req: Request) => {
    try {
      const body = await req.json();
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return new Response(
          JSON.stringify({ error: "Name, email, and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const [newUser] = await database
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

  const listUsersHandler = (database: any) => async () => {
    try {
      const allUsers = await database.select().from(schema.users);
      
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

  describe("createUser", () => {
    test("should create a user with valid data", async () => {
      const createUser = createUserHandler(db);
      const userData = createUserData();
      const mockReq = {
        json: mock(() => Promise.resolve(userData))
      };

      const response = await createUser(mockReq as any);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        id: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test("should return 400 when name is missing", async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.resolve({ email: "test@example.com", password: "password123" }))
      };

      const response = await createUser(mockReq as any);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Name, email, and password are required");
    });

    test("should return 400 when email is missing", async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.resolve({ name: "Test User", password: "password123" }))
      };

      const response = await createUser(mockReq as any);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Name, email, and password are required");
    });

    test("should handle JSON parsing errors", async () => {
      const createUser = createUserHandler(db);
      const mockReq = {
        json: mock(() => Promise.reject(new Error("Invalid JSON")))
      };

      const response = await createUser(mockReq as any);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Invalid JSON");
    });

    test("should handle duplicate email errors", async () => {
      const createUser = createUserHandler(db);
      const userData = createUserData();
      
      await db.insert(schema.users).values(userData);
      
      const mockReq = {
        json: mock(() => Promise.resolve(userData))
      };

      const response = await createUser(mockReq as any);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toContain("UNIQUE constraint failed");
    });
  });

  describe("listUsers", () => {
    test("should return empty array when no users exist", async () => {
      const listUsers = listUsersHandler(db);
      const response = await listUsers();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual([]);
    });

    test("should return all users", async () => {
      const listUsers = listUsersHandler(db);
      const userData1 = createUserData();
      const userData2 = createUserData();
      
      await db.insert(schema.users).values([userData1, userData2]);

      const response = await listUsers();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toMatchObject({
        name: userData1.name,
        email: userData1.email
      });
      expect(responseData[1]).toMatchObject({
        name: userData2.name,
        email: userData2.email
      });
    });
  });
});