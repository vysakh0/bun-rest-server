import { HTTP_STATUS, type HttpStatus } from '@constants/http';

export interface ValidationError {
  message: string;
  status: HttpStatus;
}

export const validateRequired = (
  fields: Record<string, unknown>,
  required: string[]
): ValidationError | null => {
  const missing = required.filter((field) => {
    const value = fields[field];
    return value === undefined || value === null || value === '';
  });
  if (missing.length > 0) {
    return {
      message: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`,
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email || typeof email !== 'string') {
    return {
      message: 'Email is required',
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password || typeof password !== 'string') {
    return {
      message: 'Password is required',
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (password.length < 8) {
    return {
      message: 'Password must be at least 8 characters long',
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (password.length > 128) {
    return {
      message: 'Password must be less than 128 characters long',
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  return null;
};

export const validateSignupData = (data: {
  name?: string;
  email?: string;
  password?: string;
}): ValidationError | null => {
  const requiredError = validateRequired(data, ['name', 'email', 'password']);
  if (requiredError) return requiredError;

  const emailError = validateEmail(data.email as string);
  if (emailError) return emailError;

  const passwordError = validatePassword(data.password as string);
  if (passwordError) return passwordError;

  return null;
};

export const validateUserData = (data: {
  name?: string;
  email?: string;
  password?: string;
}): ValidationError | null => {
  const requiredError = validateRequired(data, ['name', 'email', 'password']);
  if (requiredError) return requiredError;

  const emailError = validateEmail(data.email as string);
  if (emailError) return emailError;

  const passwordError = validatePassword(data.password as string);
  if (passwordError) return passwordError;

  return null;
};
