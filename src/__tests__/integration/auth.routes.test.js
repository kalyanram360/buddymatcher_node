import request from "supertest";
import app from "../../app.js";
import User from "../../models/users.js";
import connectDB from "../../db/index.js";

/**
 * Auth Routes Integration Tests
 * Tests authentication endpoints (login, signup)
 */

describe("Auth Routes Integration Tests", () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    // Note: You might want to disconnect from DB here
    // await mongoose.connection.close();
  });

  describe("POST /auth/signup", () => {
    test("should signup a new user with valid credentials", async () => {
      const newUser = {
        username: "newuser",
        Fullname: "New User",
        email: "newuser@example.com",
        password: "securePassword123",
      };

      const response = await request(app)
        .post("/auth/signup")
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    test("should fail to signup without email", async () => {
      const invalidUser = {
        username: "newuser",
        Fullname: "New User",
        password: "securePassword123",
      };

      const response = await request(app)
        .post("/auth/signup")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should fail to signup with duplicate email", async () => {
      const user = {
        username: "user1",
        Fullname: "User One",
        email: "duplicate@example.com",
        password: "securePassword123",
      };

      // First signup
      await request(app).post("/auth/signup").send(user);

      // Second signup with same email
      const response = await request(app)
        .post("/auth/signup")
        .send(user)
        .expect(400);

      expect(response.body.message).toContain("already exists");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a test user
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

    test("should fail login with incorrect password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongPassword",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
      expect(response.body).not.toHaveProperty("token");
    });

    test("should fail login with non-existent email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "testPassword123",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
    });

    test("should fail login without email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          password: "testPassword123",
        })
        .expect(400);

      expect(response.body.message).toContain("required");
    });
  });

  describe("Auth Error Handling", () => {
    test("should handle server errors gracefully", async () => {
      // Send malformed request
      const response = await request(app)
        .post("/auth/login")
        .send("invalid json")
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });
});
