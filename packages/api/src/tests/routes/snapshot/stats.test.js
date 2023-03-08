const supertest = require("supertest");
const { sanitizeFields } = require("data-sanitizer");

describe("Stats routes match the snapshot", () => {
  let app;
  let cookie = "";
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  jest.setTimeout(15000);

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({ users: "default" });

    // Log the user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: "user1@test.com" })
      .then((res) => {
        // Save the cookie to send with later requests
        cookie = global.getCookie(res) || cookie;
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // stats.listUsers ------------------------------------------------

  describe("stats.listUsers matches the snapshot", () => {
    let responseBody;

    test("stats.listUsers returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `stats.listUsers`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("stats.listUsers matches the snapshot", () => {
      responseBody.forEach((user) => {
        user.lastSeen = "[SANITIZED]";
        user.activityMap = "[SANITIZED]";
        user.createdAt = "[SANITIZED]";
      });
      expect(responseBody).toMatchSnapshot();
    });
  });

  // stats.listTopics -----------------------------------------------

  describe("stats.listTopics matches the snapshot", () => {
    let responseBody;

    test("stats.listTopics returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `stats.listTopics`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("stats.listTopics matches the snapshot", () => {
      const sanitationResult = sanitizeFields({
        data: responseBody,
        fieldNames: ["id", "createdAt"],
      });
      expect(sanitationResult.data).toMatchSnapshot();
      expect(sanitationResult.removedValues.id.join(", ")).toMatchSnapshot();
    });
  });
});
