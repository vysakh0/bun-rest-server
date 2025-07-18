import jwt from 'jsonwebtoken';

import { HTTP_STATUS } from '@/constants/http';
import { errorResponse } from '@/utils/response';

interface TokenPayload {
  userId: number;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

const SECRET = Bun.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generates a JWT token for a user
 */
export const generateToken = (userId: number): string => {
  const payload: TokenPayload = { userId };
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verifies and decodes a JWT token
 */
export const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, SECRET) as DecodedToken;
  } catch {
    return null;
  }
};

/**
 * Verify token from Authorization header
 */
export const requireAuth = (req: Request): Response | DecodedToken => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('Authorization header required', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
  }

  return decoded;
};
