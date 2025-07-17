import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

import { createdResponse, errorResponse } from '@utils/response';
import { validateSignupData } from '@utils/validation';

import { db } from '@db/config';
import { users } from '@db/schema';

import type { SignupRequest, UserResponse } from '@type/auth';
import type { AsyncHandler } from '@type/handlers';

import { HTTP_STATUS } from '@/constants/http';

export const signup: AsyncHandler = async (req) => {
  try {
    const body = (await req.json()) as SignupRequest;

    const validationError = validateSignupData(body);
    if (validationError) {
      return errorResponse(validationError.message, validationError.status);
    }

    const { name, email, password } = body;

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return errorResponse('Email already registered', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await hash(password);

    const result: UserResponse[] = await db
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

    const [newUser] = result;

    return createdResponse(newUser);
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create account', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
