import { withErrorHandler, compose, withAuth } from '@middlewares/index';

import { login, signup } from './auth';
import { createPost, getUserPosts, getAllPosts } from './posts';
import { createUser, getCurrentUser, listUsers } from './users';

const protectedRoute = compose(withErrorHandler, withAuth);
const openRoute = compose(withErrorHandler);

export const routes = {
  '/api/auth/signup': {
    POST: openRoute(signup),
  },
  '/api/auth/login': {
    POST: openRoute(login),
  },

  '/api/users': {
    GET: openRoute(listUsers),
    POST: openRoute(createUser), // Keep this public for now, or make it protected if needed
  },
  '/api/users/me': {
    GET: protectedRoute(getCurrentUser),
  },

  '/api/posts': {
    GET: openRoute(getAllPosts), // Public - anyone can view all posts
    POST: protectedRoute(createPost), // Protected - only authenticated users can create posts
  },
  '/api/posts/me': {
    GET: protectedRoute(getUserPosts), // Protected - view your own posts
  },
};
