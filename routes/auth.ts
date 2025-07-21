import { createdResponse, errorResponse, successResponse } from '@utils/response';
import { generateToken } from '@utils/token';
import { validateSignupData, validateLoginData } from '@utils/validation';

import { HTTP_STATUS } from '@/constants/http';
import type { SignupRequest, LoginRequest, UserResponse, LoginResponse } from '@/type/auth';
import type { AsyncHandler } from '@/type/handlers';
import { userQueries } from '@queries/user';

export const signup: AsyncHandler = async (req) => {
  const body = (await req.json()) as SignupRequest;

  const validationError = validateSignupData(body);
  if (validationError) {
    return errorResponse(validationError.message, validationError.status);
  }

  // After validation, we know these fields are present
  const { name, email, password } = body as Required<SignupRequest>;

  const existingUser = await userQueries.findByEmail(email);
  if (existingUser) {
    return errorResponse('Email already registered', HTTP_STATUS.CONFLICT);
  }

  const hashedPassword = await Bun.password.hash(password);

  const result = await userQueries.create({
    name,
    email,
    password: hashedPassword,
  });

  const [newUser] = result;

  if (!newUser) {
    return errorResponse('Failed to create user', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const userResponse: UserResponse = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.created_at,
    updatedAt: newUser.updated_at,
  };

  return createdResponse(userResponse);
};

export const login: AsyncHandler = async (req) => {
  const body = (await req.json()) as LoginRequest;

  const validationError = validateLoginData(body);
  if (validationError) {
    return errorResponse(validationError.message, validationError.status);
  }

  const { email, password } = body as Required<LoginRequest>;

  const user = await userQueries.findByEmail(email);
  if (!user) {
    return errorResponse('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const isValidPassword = await Bun.password.verify(password, user.password);
  if (!isValidPassword) {
    return errorResponse('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const userResponse: UserResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  const token = generateToken(user.id);

  const loginResponse: LoginResponse = {
    user: userResponse,
    token,
  };

  return successResponse(loginResponse);
};
