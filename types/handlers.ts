// General handler types for API routes
export type AsyncHandler = (req: Request) => Promise<Response>;
export type SyncHandler = () => Response;
export type AsyncNoRequestHandler = () => Promise<Response>;

// Common handler union types
export type Handler = AsyncHandler | SyncHandler | AsyncNoRequestHandler;
