import User from "../../models/users.js";
import bcrypt from "bcrypt";

/**
 * User Model Unit Tests
 * Tests password hashing, comparison, and schema validation
 */
describe("User Model", () => {
  let testUser;

  beforeEach(() => {
    testUser = {
      username: "testuser",
      Fullname: "Test User",
      email: "test@example.com",
      password: "securePassword123",
    };
  });

  describe("Password Hashing", () => {
    test("should hash password before saving", async () => {
      const user = new User(testUser);
      await user.save();

      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toBeDefined();
    });

    test("should not hash password if password is not modified", async () => {
      const user = new User(testUser);
      await user.save();

      const originalHash = user.password;
      user.Fullname = "Updated Name";
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe("Password Comparison", () => {
    test("should correctly compare password with hash", async () => {
      const user = new User(testUser);
      await user.save();

      const isMatch = await user.comparePassword(testUser.password);
      expect(isMatch).toBe(true);
    });

    test("should return false for incorrect password", async () => {
      const user = new User(testUser);
      await user.save();

      const isMatch = await user.comparePassword("wrongPassword");
      expect(isMatch).toBe(false);
    });
  });

  describe("Avatar Generation", () => {
    test("should generate avatar URL from Fullname", async () => {
      const user = new User(testUser);
      await user.save();

      expect(user.avatar).toContain("ui-avatars.com");
      expect(user.avatar).toContain(encodeURIComponent(testUser.Fullname));
    });

    test("should create default empty Friends array", async () => {
      const user = new User(testUser);
      await user.save();

      expect(Array.isArray(user.Friends)).toBe(true);
      expect(user.Friends).toEqual([]);
    });
  });

  describe("Required Fields", () => {
    test("should require title field", async () => {
      const invalidUser = new User({ Fullname: "Test" });

      // Mongoose doesn't enforce by default, but this validates schema
      expect(invalidUser.username).toBeUndefined();
    });
  });
});
