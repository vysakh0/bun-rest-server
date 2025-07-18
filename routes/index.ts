import { withAuth } from '@middlewares/auth';

import { login, signup } from './auth';
import { createUser, getCurrentUser, listUsers } from './users';

export const routes = {
  // Public routes
  '/api/auth/signup': {
    POST: signup,
  },
  '/api/auth/login': {
    POST: login,
  },

  // Protected routes
  '/api/users': {
    GET: withAuth(listUsers),
    POST: createUser, // Keep this public for now, or make it protected if needed
  },
  '/api/users/me': {
    GET: withAuth(getCurrentUser),
  },
};
