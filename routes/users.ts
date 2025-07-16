import { db } from '@db/config';
import { users } from '@db/schema';

export const createUser = async (req: Request): Promise<Response> => {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
        status: 400,
      });
    }

    const [newUser] = await db.insert(users).values({ name, email, password }).returning();

    return new Response(JSON.stringify(newUser), {
      status: 201,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
};

export const listUsers = async (): Promise<Response> => {
  try {
    const allUsers = await db.select().from(users);

    return new Response(JSON.stringify(allUsers));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
};
