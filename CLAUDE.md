---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: '*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json'
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `nohup bun run ./index.ts > server.log 2>&1 &` to start the dev server and make sure to kill it once you're done with the testing.
- Use `bun test` for running unit and integration tests
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Project Structure

This project is a Bun-based REST API with SQLite database using a route-based structure:

### Core Files

- `index.ts` - Main server entry point using `Bun.serve()` on port 3001
- `package.json` - Dependencies: argon2, better-sqlite3, drizzle-orm, drizzle-kit
- `tsconfig.json` - TypeScript configuration
- `bunfig.toml` - Bun configuration
- `drizzle.config.ts` - Drizzle ORM configuration

### API Routes

- `routes/index.ts` - Central route definitions and routing logic
- `routes/users.ts` - User CRUD
- `...`

### Database Layer

- `db/config.ts` - Database connection configuration
- `db/schema/index.ts` - Schema exports
- `db/schema/users.ts` - Users table schema..
- `db/schema/..*.ts` - Table schema

- `db/migrations/` - SQL migration files and metadata
- `app.db` - SQLite database file (feel free to delete and create in situations when the data already exists and migration is failing)

### Testing

**IMPORTANT**: Tests are self-contained and DO NOT require the dev server to be running. Integration tests create their own test server with an in-memory database.

#### Test Structure

- `tests/setup.ts` - Test setup with in-memory database for integration tests
- `tests/unit/` - Unit tests that test individual functions in isolation
  - `tests/unit/users.test.ts` - Unit tests for user route handlers
- `tests/integration/` - Integration tests that test full API endpoints
  - `tests/integration/users.integration.test.ts` - Full API tests with test server
- `tests/factories/` - Test data factories
  - `tests/factories/user.factory.ts` - Creates test user data
- `utils/math.test.ts` - Utility function tests

#### Running Tests

```bash
# Run all tests (unit and integration)
bun test

# Run specific test file
bun test tests/unit/users.test.ts

# Run tests in a directory
bun test tests/integration/
```

#### How Tests Work

- **Unit Tests**: Test individual functions with mocked dependencies
- **Integration Tests**:
  - Create their own Bun server instance on port 3002
  - Use in-memory SQLite database (`:memory:`)
  - Run migrations on the test database
  - Test full HTTP request/response cycle
  - Clean up after each test
  - DO NOT require the dev server to be running

#### Testing Guidelines

- **Routes**: Always write integration tests for any new routes or API endpoints
- **Complex Logic**: Write unit tests for any complex logic in `utils/`, `service/`, `lib/`, or similar folders
- **Directory Structure**: Place unit tests in `tests/unit/` with matching subdirectories (e.g., `tests/unit/utils/`, `tests/unit/service/`)

### Types

- `types/handlers.ts` - API handler type definitions for different request/response patterns
- `types/auth.ts` - Authentication-related request/response types
- `types/users.ts` - User-related request/response types

**When creating new route handlers**, always use the handler types from `types/handlers.ts`:

- `AsyncHandler` - For handlers that accept a Request and return Promise<Response>
- `AsyncNoRequestHandler` - For handlers that don't need request data and return Promise<Response>
- `SyncHandler` - For synchronous handlers that return Response directly

Example:

```typescript
import type { AsyncHandler } from '@type/handlers';

export const myHandler: AsyncHandler = async (req) => {
  // Handler implementation
};
```

### Utilities

- `utils/math.ts` - Mathematical utility functions (add, multiply, divide)

### Generated/Runtime Files

- `server.log` - Server runtime logs
- `bun.lock` - Bun package lock file
- `node_modules/` - Dependencies

## Database

- Using SQLite with Drizzle ORM
- Database file: `app.db`
- Users table includes: id, name, email, password (argon2 hashed), createdAt, updatedAt

## Running the Server

```bash
# Run in background with logs
nohup bun run ./index.ts > server.log 2>&1 &
```

## Database Commands

```bash
# Generate migrations
bun run drizzle-kit generate

# Apply migrations
bun run drizzle-kit migrate
```

## Testing API Endpoints

Whenever you create an endpoint, make sure to test it by running the server and using curl like this.

```bash
# Test signup endpoint
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

## Code Style & Quality

This project uses ESLint with TypeScript and Prettier for code quality and formatting:

- **Path Aliases**: Use `@db/*`, `@routes/*`, `@tests/*`, `@utils/*`, `@type/*` instead of relative imports
- **Function Style**: Prefer arrow functions for exports instead of functions declarations
- **Error Handling**: Use `unknown` type in catch blocks, check with `instanceof Error`
- **TypeScript**: Explicit return types required, consistent type imports with `type` keyword
- **Imports**: Auto-organized and alphabetized with proper grouping
- **Pre-commit**: Automatic linting and formatting via Husky hooks

Run `bun run lint` to check code quality and `bun run lint:fix` to auto-fix issues.
