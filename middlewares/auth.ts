import { requireAuth } from '@utils/token';

import type { AsyncHandler, AsyncNoRequestHandler } from '@/type/handlers';

export const withAuth = (handler: AsyncHandler | AsyncNoRequestHandler): AsyncHandler => {
  return async (req: Request) => {
    const authResult = requireAuth(req);

    if (authResult instanceof Response) {
      return authResult;
    }

    const modifiedReq = new Request(req, {
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        'X-User-Id': authResult.userId.toString(),
      },
    });

    if (handler.length === 0) {
      return (handler as AsyncNoRequestHandler)();
    }
    return (handler as AsyncHandler)(modifiedReq);
  };
};

export const getUserId = (req: Request): number | null => {
  const userId = req.headers.get('X-User-Id');
  return userId ? parseInt(userId, 10) : null;
};
