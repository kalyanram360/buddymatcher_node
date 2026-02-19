import { jest } from "@jest/globals";
import dotenv from "dotenv";

// Load .env.test for test environment
dotenv.config({ path: ".env.test" });

globalThis.jest = jest;

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
