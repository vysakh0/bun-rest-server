import { HTTP_STATUS } from '@constants/http';

import { errorResponse } from '@utils/response';

import type { AsyncHandler } from '@/type/handlers';

export const withErrorHandler = (handler: AsyncHandler): AsyncHandler => {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Error in handler:', error);

      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return errorResponse('Invalid JSON format', HTTP_STATUS.BAD_REQUEST);
      }

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return errorResponse(errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};
