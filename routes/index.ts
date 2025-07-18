import { withErrorHandler, withProtection } from '@middlewares/index';

import { login, signup } from './auth';
import { createUser, getCurrentUser, listUsers } from './users';

// Create a protected middleware chain that includes error handling and authentication
const protectedRoute = withProtection(withErrorHandler);

export const routes = {
  // Public routes (with error handling)
  '/api/auth/signup': {
    POST: withErrorHandler(signup),
  },
  '/api/auth/login': {
    POST: withErrorHandler(login),
  },

  // Protected routes (with error handling and authentication)
  '/api/users': {
    GET: protectedRoute(listUsers),
    POST: withErrorHandler(createUser), // Keep this public for now, or make it protected if needed
  },
  '/api/users/me': {
    GET: protectedRoute(getCurrentUser),
  },
};
