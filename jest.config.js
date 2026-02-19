export default {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.js"],
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
