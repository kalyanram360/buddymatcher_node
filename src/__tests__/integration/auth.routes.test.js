import request from "supertest";
import app from "../../app.js";
import User from "../../models/users.js";
import connectDB from "../../db/index.js";

describe("Auth Routes Integration Tests", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        username: "testuser",
        Fullname: "Test User",
        email: "test@example.com",
        password: "testPassword123",
      });
      await user.save();
    });

    test("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "testPassword123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.message).toBe("Login successful");
    });
  });
});
