import { requireAuth } from '@utils/token';

import type { AsyncHandler, AsyncNoRequestHandler } from '@/type/handlers';

/**
 * Wraps a handler with authentication middleware
 */
export const withAuth = (handler: AsyncHandler | AsyncNoRequestHandler): AsyncHandler => {
  return async (req: Request) => {
    const authResult = requireAuth(req);

    // If authResult is a Response, it means authentication failed
    if (authResult instanceof Response) {
      return authResult;
    }

    // Add the decoded token to the request object by creating a new request
    // with the auth data in a custom header (since we can't modify the request object)
    const modifiedReq = new Request(req, {
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        'X-User-Id': authResult.userId.toString(),
      },
    });

    // Call the original handler with the modified request
    // Check if it's a no-request handler by checking the function length
    if (handler.length === 0) {
      return (handler as AsyncNoRequestHandler)();
    }
    return (handler as AsyncHandler)(modifiedReq);
  };
};

/**
 * Helper to get the authenticated user ID from the request
 */
export const getUserId = (req: Request): number | null => {
  const userId = req.headers.get('X-User-Id');
  return userId ? parseInt(userId, 10) : null;
};
