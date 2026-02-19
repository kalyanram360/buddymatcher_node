import Problems from "../../models/Problems.js";

/**
 * Problems Model Unit Tests
 * Tests schema validation and default values
 */
describe("Problems Model", () => {
  describe("Schema Validation", () => {
    test("should require title field", async () => {
      const problem = new Problems({});

      const error = problem.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    test("should create problem with title", async () => {
      const problem = new Problems({
        title: "Algorithm Problem",
      });

      expect(problem.title).toBe("Algorithm Problem");
    });

    test("should set default online_now to 1", async () => {
      const problem = new Problems({
        title: "Test Problem",
      });

      expect(problem.online_now).toBe(1);
    });

    test("should allow custom online_now value", async () => {
      const problem = new Problems({
        title: "Test Problem",
        online_now: 5,
      });

      expect(problem.online_now).toBe(5);
    });
  });

  describe("Field Types", () => {
    test("title should be string type", async () => {
      const problem = new Problems({
        title: "Test",
      });

      expect(typeof problem.title).toBe("string");
    });

    test("online_now should be number type", async () => {
      const problem = new Problems({
        title: "Test",
        online_now: 3,
      });

      expect(typeof problem.online_now).toBe("number");
    });
  });
});
