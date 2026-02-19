import request from "supertest";
import app from "../../app.js";
import Problems from "../../models/Problems.js";
import User from "../../models/users.js";
import connectDB from "../../db/index.js";
import jwt from "jsonwebtoken";

/**
 * Problems Routes Integration Tests
 * Tests problem endpoints
 */

describe("Problems Routes Integration Tests", () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await Problems.deleteMany({});
    await User.deleteMany({});

    // Create test user and token
    const user = new User({
      username: "testuser",
      Fullname: "Test User",
      email: "test@example.com",
      password: "testPassword123",
    });
    const savedUser = await user.save();
    testUserId = savedUser._id.toString();

    authToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await Problems.deleteMany({});
    await User.deleteMany({});
  });

  describe("GET /problems", () => {
    test("should get all problems", async () => {
      const problem1 = new Problems({ title: "Problem 1" });
      const problem2 = new Problems({ title: "Problem 2" });
      await problem1.save();
      await problem2.save();

      const response = await request(app).get("/problems").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    test("should return empty array when no problems exist", async () => {
      const response = await request(app).get("/problems").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("POST /problems", () => {
    test("should create a new problem with authentication", async () => {
      const newProblem = {
        title: "New Algorithm Problem",
      };

      const response = await request(app)
        .post("/problems")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newProblem)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe("New Algorithm Problem");
      expect(response.body.online_now).toBe(1);
    });

    test("should fail to create problem without authentication", async () => {
      const newProblem = {
        title: "New Problem",
      };

      const response = await request(app)
        .post("/problems")
        .send(newProblem)
        .expect(401);

      expect(response.body.message).toContain("unauthorized");
    });

    test("should fail to create problem without title", async () => {
      const response = await request(app)
        .post("/problems")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain("required");
    });
  });

  describe("GET /problems/:id", () => {
    test("should get a specific problem by id", async () => {
      const problem = new Problems({ title: "Specific Problem" });
      const savedProblem = await problem.save();

      const response = await request(app)
        .get(`/problems/${savedProblem._id}`)
        .expect(200);

      expect(response.body._id).toBe(savedProblem._id.toString());
      expect(response.body.title).toBe("Specific Problem");
    });

    test("should return 404 for non-existent problem", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/problems/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain("not found");
    });
  });

  describe("PUT /problems/:id", () => {
    test("should update a problem with authentication", async () => {
      const problem = new Problems({ title: "Original Title", online_now: 3 });
      const savedProblem = await problem.save();

      const response = await request(app)
        .put(`/problems/${savedProblem._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Title", online_now: 5 })
        .expect(200);

      expect(response.body.title).toBe("Updated Title");
      expect(response.body.online_now).toBe(5);
    });

    test("should fail to update without authentication", async () => {
      const problem = new Problems({ title: "Original" });
      const savedProblem = await problem.save();

      const response = await request(app)
        .put(`/problems/${savedProblem._id}`)
        .send({ title: "Updated" })
        .expect(401);

      expect(response.body.message).toContain("unauthorized");
    });
  });

  describe("DELETE /problems/:id", () => {
    test("should delete a problem with authentication", async () => {
      const problem = new Problems({ title: "To Delete" });
      const savedProblem = await problem.save();

      const response = await request(app)
        .delete(`/problems/${savedProblem._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain("deleted");

      // Verify deletion
      const getResponse = await request(app)
        .get(`/problems/${savedProblem._id}`)
        .expect(404);
    });

    test("should fail to delete without authentication", async () => {
      const problem = new Problems({ title: "To Delete" });
      const savedProblem = await problem.save();

      const response = await request(app)
        .delete(`/problems/${savedProblem._id}`)
        .expect(401);

      expect(response.body.message).toContain("unauthorized");
    });
  });
});
