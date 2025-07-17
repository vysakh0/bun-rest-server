# bun-proj

A Bun-based REST API with SQLite database using Drizzle ORM.

## Quick Start

```bash
# Install dependencies
bun install

# Apply database migrations
bun run drizzle-kit migrate

# Start development server
bun --hot ./index.ts
```

## Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/users.test.ts
```

## Database

```bash
# Generate migrations
bun run drizzle-kit generate

# Apply migrations
bun run drizzle-kit migrate
```

## Code Quality

```bash
# Check code quality
bun run lint

# Auto-fix issues
bun run lint:fix
```

## Project Structure

- `index.ts` - Main server entry point (port 3001)
- `routes/` - API route handlers
- `db/` - Database configuration and schemas
- `tests/` - Unit and integration tests
- `types/` - TypeScript type definitions

The server uses `Bun.serve()` and connects to SQLite via Drizzle ORM.
