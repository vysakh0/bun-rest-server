import { createdResponse, errorResponse, successResponse } from '@utils/response';
import { validateUserData } from '@utils/validation';

import { getUserId } from '@middlewares/auth';

import { HTTP_STATUS } from '@/constants/http';
import type { AsyncHandler, AsyncNoRequestHandler } from '@/type/handlers';
import type { CreateUserRequest } from '@/type/users';
import { userQueries } from '@queries/user';

export const createUser: AsyncHandler = async (req) => {
  const body = (await req.json()) as CreateUserRequest;

  const validationError = validateUserData(body);
  if (validationError) {
    return errorResponse(validationError.message, validationError.status);
  }

  // After validation, we know these fields are present
  const { name, email, password } = body as Required<CreateUserRequest>;
  const hashedPassword = await Bun.password.hash(password);
  await userQueries.create({ name, email, password: hashedPassword });

  return createdResponse({ message: 'User created successfully' });
};

export const listUsers: AsyncNoRequestHandler = async () => {
  const allUsers = await userQueries.findAll();
  return successResponse(allUsers);
};

export const getCurrentUser: AsyncHandler = async (req) => {
  const userId = getUserId(req);
  if (!userId) {
    return errorResponse('User ID not found', HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await userQueries.findById(userId);
  if (!user) {
    return errorResponse('User not found', HTTP_STATUS.NOT_FOUND);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return successResponse(userWithoutPassword);
};
