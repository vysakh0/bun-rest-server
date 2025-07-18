import { createdResponse, errorResponse, successResponse } from '@utils/response';
import { generateToken } from '@utils/token';
import { validateSignupData, validateLoginData } from '@utils/validation';

import { users } from '@db/schema';

import { HTTP_STATUS } from '@/constants/http';
import type { SignupRequest, LoginRequest, UserResponse, LoginResponse } from '@/type/auth';
import type { AsyncHandler } from '@/type/handlers';
import { userQueries } from '@queries/user';

export const signup: AsyncHandler = async (req) => {
  try {
    let body: SignupRequest;

    try {
      body = (await req.json()) as SignupRequest;
    } catch (jsonError: unknown) {
      if (jsonError instanceof SyntaxError) {
        return errorResponse('Invalid JSON format', HTTP_STATUS.BAD_REQUEST);
      }
      throw jsonError;
    }

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

    const result: UserResponse[] = await userQueries
      .create({
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

export const login: AsyncHandler = async (req) => {
  try {
    let body: LoginRequest;

    try {
      body = (await req.json()) as LoginRequest;
    } catch (jsonError: unknown) {
      if (jsonError instanceof SyntaxError) {
        return errorResponse('Invalid JSON format', HTTP_STATUS.BAD_REQUEST);
      }
      throw jsonError;
    }

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = generateToken(user.id);

    const loginResponse: LoginResponse = {
      user: userResponse,
      token,
    };

    return successResponse(loginResponse);
  } catch (error: unknown) {
    console.error('Login error:', error);
    return errorResponse('Failed to login', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
