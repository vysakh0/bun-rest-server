import { helloHandler } from './hello';
import { createUser, listUsers } from './users';
import { signup } from './auth';

export const routes = {
  '/hello': helloHandler,
  '/api/users': {
    GET: listUsers,
    POST: createUser,
  },
  '/api/auth/signup': {
    POST: signup,
  },
};
