import jwt from "jsonwebtoken";

/**
 * Test Utilities
 * Helper functions for testing
 */

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (userId = "507f1f77bcf86cd799439011") => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

/**
 * Generate test user data
 */
export const generateTestUser = (overrides = {}) => {
  return {
    username: "testuser",
    Fullname: "Test User",
    email: "test@example.com",
    password: "testPassword123",
    ...overrides,
  };
};

/**
 * Generate test problem data
 */
export const generateTestProblem = (overrides = {}) => {
  return {
    title: "Test Problem",
    online_now: 1,
    ...overrides,
  };
};

/**
 * Create mock request object
 */
export const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    headers: {},
    params: {},
    query: {},
    user: null,
    ...overrides,
  };
};

/**
 * Create mock response object
 */
export const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};
