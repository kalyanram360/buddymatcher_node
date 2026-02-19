import login from "../../controlers/auth.controler.js";
import User from "../../models/users.js";
import jwt from "jsonwebtoken";

/**
 * Auth Controller Unit Tests
 * Tests login, signup, and authentication logic
 */
jest.mock("../../models/users.js");
jest.mock("jsonwebtoken");

describe("Auth Controller - Login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "testPassword123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("Successful Login", () => {
    test("should return token and user data on successful login", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        username: "testuser",
        avatar: "http://example.com/avatar.jpg",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("mockToken123");

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockUser.comparePassword).toHaveBeenCalledWith("testPassword123");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user123" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: "mockToken123",
          user: expect.objectContaining({
            id: "user123",
            email: "test@example.com",
            username: "testuser",
          }),
        }),
      );
    });
  });

  describe("Failed Login", () => {
    test("should return 401 if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    test("should return 401 if password is incorrect", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    test("should return 500 on server error", async () => {
      const error = new Error("Database connection failed");
      User.findOne.mockRejectedValue(error);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Server error",
          error: "Database connection failed",
        }),
      );
    });
  });

  describe("Request Validation", () => {
    test("should work with valid email and password", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        username: "testuser",
        avatar: "http://example.com/avatar.jpg",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("mockToken123");

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
