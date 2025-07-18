import { withErrorHandler, compose, withAuth } from '@middlewares/index';

import { login, signup } from './auth';
import { createPost, getUserPosts, getAllPosts } from './posts';

const protectedRoute = compose(withErrorHandler, withAuth);
const openRoute = compose(withErrorHandler);

export const routes = {
  '/api/auth/signup': {
    POST: openRoute(signup),
  },
  '/api/auth/login': {
    POST: openRoute(login),
  },
  '/api/posts': {
    GET: openRoute(getAllPosts),
    POST: protectedRoute(createPost),
  },
  '/api/posts/me': {
    GET: protectedRoute(getUserPosts),
  },
};
