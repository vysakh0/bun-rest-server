---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `nohup bun run ./index.ts > server.log 2>&1 &` to start the dev server and make sure to kill it once you're done with the testing.
- Use `bun test` for testing unit and integration testing
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Project Structure

This project uses a route-based API structure:

- `index.ts` - Main server entry point using `Bun.serve()` on port 3001
- `routes/index.ts` - Central route definitions
- `routes/users.ts` - User CRUD operations
- `routes/auth.ts` - Authentication endpoints (signup, etc.)
- `db/schema/users.ts` - Drizzle ORM schema definitions
- `db/config.ts` - Database configuration
- `db/migrations/` - SQL migration files

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
