import { signup } from './auth';
import { createUser, listUsers } from './users';

export const routes = {
  '/api/users': {
    GET: listUsers,
    POST: createUser,
  },
  '/api/auth/signup': {
    POST: signup,
  },
};
