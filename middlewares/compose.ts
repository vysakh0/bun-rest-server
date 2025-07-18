import type { AsyncHandler } from '@/type/handlers';

export type Middleware = (handler: AsyncHandler) => AsyncHandler;

export const compose = (...middlewares: Middleware[]) => {
  return (handler: AsyncHandler): AsyncHandler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
};

export const withProtection = compose;
