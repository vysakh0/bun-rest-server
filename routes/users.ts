import { hash } from 'argon2';

import { createdResponse, errorResponse, successResponse } from '@utils/response';
import { validateUserData } from '@utils/validation';

import { db } from '@db/config';
import { users } from '@db/schema';

import { HTTP_STATUS } from '@/constants/http';
import type { AsyncHandler, AsyncNoRequestHandler } from '@/type/handlers';
import type { CreateUserRequest } from '@/type/users';

export const createUser: AsyncHandler = async (req) => {
  try {
    const body = (await req.json()) as CreateUserRequest;

    const validationError = validateUserData(body);
    if (validationError) {
      return errorResponse(validationError.message, validationError.status);
    }

    // After validation, we know these fields are present
    const { name, email, password } = body as Required<CreateUserRequest>;
    const hashedPassword = await hash(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning();

    return createdResponse(newUser);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const listUsers: AsyncNoRequestHandler = async () => {
  try {
    const allUsers = await db.select().from(users);
    return successResponse(allUsers);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
