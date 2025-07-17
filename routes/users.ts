import { createdResponse, errorResponse, successResponse } from '@utils/response';
import { validateUserData } from '@utils/validation';

import { db } from '@db/config';
import { users } from '@db/schema';

import type { AsyncHandler, AsyncNoRequestHandler } from '@type/handlers';
import type { CreateUserRequest } from '@type/users';

import { HTTP_STATUS } from '@/constants/http';

export const createUser: AsyncHandler = async (req) => {
  try {
    const body = (await req.json()) as CreateUserRequest;

    const validationError = validateUserData(body);
    if (validationError) {
      return errorResponse(validationError.message, validationError.status);
    }

    const { name, email, password } = body;
    const [newUser] = await db.insert(users).values({ name, email, password }).returning();

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
