import { describe, expect, it } from 'bun:test';

import { HTTP_STATUS } from '@constants/http';

import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateSignupData,
} from '@utils/validation';

describe('validateRequired', () => {
  it('should return null when all required fields are present', () => {
    const fields = { name: 'John', email: 'john@example.com', password: 'password123' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toBeNull();
  });

  it('should return error when single field is missing', () => {
    const fields = { name: 'John', email: 'john@example.com' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toEqual({
      message: 'password is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error when multiple fields are missing', () => {
    const fields = { name: 'John' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toEqual({
      message: 'email, password are required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should treat empty string as missing', () => {
    const fields = { name: '', email: 'john@example.com', password: 'password123' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toEqual({
      message: 'name is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should treat null as missing', () => {
    const fields = { name: null, email: 'john@example.com', password: 'password123' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toEqual({
      message: 'name is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should treat undefined as missing', () => {
    const fields = { name: undefined, email: 'john@example.com', password: 'password123' };
    const result = validateRequired(fields, ['name', 'email', 'password']);
    expect(result).toEqual({
      message: 'name is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });
});

describe('validateEmail', () => {
  it('should return null for valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result).toBeNull();
  });

  it('should return error for empty email', () => {
    const result = validateEmail('');
    expect(result).toEqual({
      message: 'Email is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for non-string email', () => {
    const result = validateEmail(123 as unknown as string);
    expect(result).toEqual({
      message: 'Email is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result).toEqual({
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for email without domain', () => {
    const result = validateEmail('test@');
    expect(result).toEqual({
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for email without @ symbol', () => {
    const result = validateEmail('testexample.com');
    expect(result).toEqual({
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should handle email with whitespace', () => {
    const result = validateEmail('  test@example.com  ');
    expect(result).toBeNull();
  });
});

describe('validatePassword', () => {
  it('should return null for valid password', () => {
    const result = validatePassword('password123');
    expect(result).toBeNull();
  });

  it('should return error for empty password', () => {
    const result = validatePassword('');
    expect(result).toEqual({
      message: 'Password is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for non-string password', () => {
    const result = validatePassword(123 as unknown as string);
    expect(result).toEqual({
      message: 'Password is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for password less than 8 characters', () => {
    const result = validatePassword('1234567');
    expect(result).toEqual({
      message: 'Password must be at least 8 characters long',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for password longer than 128 characters', () => {
    const longPassword = 'a'.repeat(129);
    const result = validatePassword(longPassword);
    expect(result).toEqual({
      message: 'Password must be less than 128 characters long',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should accept exactly 8 characters', () => {
    const result = validatePassword('12345678');
    expect(result).toBeNull();
  });

  it('should accept exactly 128 characters', () => {
    const password = 'a'.repeat(128);
    const result = validatePassword(password);
    expect(result).toBeNull();
  });
});

describe('validateSignupData', () => {
  it('should return null for valid signup data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };
    const result = validateSignupData(data);
    expect(result).toBeNull();
  });

  it('should return error for missing name', () => {
    const data = {
      email: 'john@example.com',
      password: 'password123',
    };
    const result = validateSignupData(data);
    expect(result).toEqual({
      message: 'name is required',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
    };
    const result = validateSignupData(data);
    expect(result).toEqual({
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return error for short password', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    };
    const result = validateSignupData(data);
    expect(result).toEqual({
      message: 'Password must be at least 8 characters long',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should return first validation error encountered', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      password: '123',
    };
    const result = validateSignupData(data);
    expect(result).toEqual({
      message: 'Invalid email format',
      status: HTTP_STATUS.BAD_REQUEST,
    });
  });
});
