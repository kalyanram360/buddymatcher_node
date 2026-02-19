import User from "../../models/users.js";
import connectDB from "../../db/index.js";

describe("User Model", () => {
  let testUser;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(() => {
    testUser = {
      username: "testuser",
      Fullname: "Test User",
      email: "test@example.com",
      password: "securePassword123",
    };
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  test("should hash password before saving", async () => {
    const user = new User(testUser);
    await user.save();

    expect(user.password).not.toBe(testUser.password);
    expect(user.password).toBeDefined();
  });
});
