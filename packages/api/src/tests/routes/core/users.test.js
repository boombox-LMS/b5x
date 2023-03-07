const supertest = require("supertest");
const { sanitizeFields } = require("data-sanitizer");
const { UserProfileSchema, UserWithGroupNamesSchema } = require("@b5x/types");
const { z } = require("zod");

describe("Users routes should match expectations", () => {
  let app;
  let cookie = "";
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // users.profile --------------------------------------------------

  describe("users.profile matches expectations", () => {
    let responseBody;

    test("users.profile returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `users.profile?username=completed-1`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("users.profile returns the correct data type", () => {
      const ResponseBodySchema = UserProfileSchema.extend({
        username: z.literal("completed-1"),
      });

      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });

    test("users.profile matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // users.modifyGroups ---------------------------------------------

  describe("users.modifyGroups matches expectations", () => {
    let responseBody;

    test("users.modifyGroups returns a 200", async () => {
      const requestBody = {
        users: [
          {
            email: "blank-2@test.com",
            addToGroups: ["new-group-1", "new-group-2", "new-group-3"],
            removeFromGroups: [],
          },
          {
            email: "totally-new-user@test.com",
            addToGroups: ["new-group-1", "new-group-2"],
            removeFromGroups: [],
          },
          {
            email: "totally-new-user-2@test.com",
            addToGroups: [
              "new-group-1",
              "new-group-2",
              "new-group-3",
              "new-group-4",
            ],
            removeFromGroups: [],
          },
        ],
      };

      await supertest(app)
        .post(apiPrefix + "users.modifyGroups")
        .set("Cookie", cookie)
        .send(requestBody)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("users.modifyGroups returns the correct data type", () => {
      const ResponseBodySchema = z.array(UserWithGroupNamesSchema);
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });

    test("users.modifyGroups matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });
});
