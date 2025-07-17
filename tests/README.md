# User API Tests

This directory contains unit and integration tests for the users functionality in the Bun project.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup (database initialization)
├── factories/
│   └── user.factory.ts        # User data factories for testing
├── integration/
│   └── users.integration.test.ts  # API integration tests
└── README.md                  # This file

routes/
└── users.test.ts              # Unit tests for user route handlers
```

## Running Tests

```bash
# Run all tests
bun test

# Run only unit tests
bun test routes/users.test.ts

# Run only integration tests
bun test tests/integration/

# Run tests in watch mode
bun test --watch
```

## Test Database

- Unit tests use an in-memory SQLite database that's created fresh for each test
- Integration tests spin up a test server on port 3002 with an in-memory database
- Each test is isolated and doesn't affect the production database

## Testing Best Practices

1. **Isolation**: Each test runs with a clean database state
2. **Test Data**: Use factories (`buildUserData()`) to generate test data
3. **Coverage**: Tests cover:
   - Happy path scenarios
   - Error handling (validation, database errors)
   - Edge cases (malformed JSON, duplicate emails)
   - API contract (status codes, response formats)

## Test Categories

### Unit Tests (`routes/users.test.ts`)

- Test individual route handlers in isolation
- Mock request objects
- Direct database access for setup/verification

### Integration Tests (`tests/integration/users.integration.test.ts`)

- Test full API endpoints through HTTP requests
- Verify server behavior and response formats
- Test error scenarios at the HTTP level
