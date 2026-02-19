# BuddyMatcher - Testing Guide

This document describes the test setup and how to run tests for the BuddyMatcher Node.js application.

## 📋 Test Structure

Tests are organized into two main categories:

### Unit Tests (`src/__tests__/unit/`)

- **user.model.test.js** - Tests for User model
  - Password hashing and comparison
  - Avatar generation
  - Default field values
- **problems.model.test.js** - Tests for Problems model
  - Schema validation
  - Field types and defaults
- **auth.controller.test.js** - Tests for Auth controller
  - Login functionality
  - Error handling
  - JWT token generation

### Integration Tests (`src/__tests__/integration/`)

- **auth.routes.test.js** - Tests for authentication endpoints
  - POST /auth/signup
  - POST /auth/login
  - Error handling
- **problems.routes.test.js** - Tests for problems endpoints
  - GET /problems
  - POST /problems
  - GET /problems/:id
  - PUT /problems/:id
  - DELETE /problems/:id

## 🚀 Running Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure MongoDB is running (locally or via MongoDB Atlas)

3. Set up `.env.test` file with test configuration (already included)

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- auth.controller.test.js
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Only Unit Tests

```bash
npm test -- __tests__/unit
```

### Run Only Integration Tests

```bash
npm test -- __tests__/integration
```

## 📊 Test Coverage

The test suite covers:

- ✅ User authentication (login, signup)
- ✅ Password hashing and validation
- ✅ JWT token generation
- ✅ Problem CRUD operations
- ✅ API route handling
- ✅ Error handling and validation
- ✅ Authentication middleware
- ✅ Database model validation

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- Test environment: Node.js
- Auto-discovery of test files: `*.test.js` and `*.spec.js`
- Coverage collection from `src/` directory

### Test Setup (`jest.setup.js`)

- Silences console logs during tests

### Environment Variables (`.env.test`)

- `MONGODB_URI`: Test database connection
- `JWT_SECRET`: Test JWT secret key
- `NODE_ENV`: Set to "test"

## 📝 Writing New Tests

### Example Unit Test

```javascript
describe("Feature Name", () => {
  test("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = someFunction(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Example Integration Test

```javascript
describe("API Endpoint", () => {
  test("should return data", async () => {
    const response = await request(app).get("/api/endpoint").expect(200);

    expect(response.body).toHaveProperty("data");
  });
});
```

## 🛠️ Helpful Test Utilities

Located in `src/__tests__/utils/testUtils.js`:

- `generateTestToken()` - Create test JWT token
- `generateTestUser()` - Create test user data
- `generateTestProblem()` - Create test problem data
- `createMockRequest()` - Create mocked request object
- `createMockResponse()` - Create mocked response object

### Usage Example

```javascript
import { generateTestToken, generateTestUser } from "../utils/testUtils.js";

const token = generateTestToken();
const user = generateTestUser({ email: "custom@example.com" });
```

## 🐛 Debugging Tests

### Run Single Test

```bash
npm test -- user.model.test.js -t "should hash password"
```

### Enable Console Logs

Comment out the silencing in `jest.setup.js` to see console output during tests.

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## ✅ Best Practices

1. **Isolation** - Each test should be independent
2. **Clarity** - Use descriptive test names
3. **Setup/Teardown** - Use `beforeEach()` and `afterEach()` for cleanup
4. **Mocking** - Mock external dependencies like database and APIs
5. **Assertions** - Test behavior, not implementation
6. **Organization** - Group related tests with `describe()` blocks

## 🔄 Continuous Integration

For CI/CD pipelines, use:

```bash
npm test -- --ci --coverage
```

This runs tests in CI mode with coverage reporting.

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## 🤝 Contributing Tests

When adding new features:

1. Write tests first (TDD approach)
2. Implement the feature
3. Ensure all tests pass
4. Update this README if needed

---

**Last Updated:** February 2026
