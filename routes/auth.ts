import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

import { db } from '@db/config';
import { users } from '@db/schema';

export const signup = async (req: Request): Promise<Response> => {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
        status: 400,
      });
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
      });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
      });
    }

    const hashedPassword = await hash(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return new Response(JSON.stringify(newUser), {
      status: 201,
    });
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
      status: 500,
    });
  }
};
