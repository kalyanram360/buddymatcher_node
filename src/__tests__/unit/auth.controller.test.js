import login from "../../controlers/auth.controler.js";
import User from "../../models/users.js";
import jwt from "jsonwebtoken";

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

  test("should return 201 status on successful login", async () => {
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

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Login successful",
        token: "mockToken123",
      }),
    );
  });
});
