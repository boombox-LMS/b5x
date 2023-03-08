const supertest = require("supertest");
const { sanitizeFields } = require("data-sanitizer");
const {
  PublicUserWithStatsSchema,
  PublicTopicWithStatsSchema,
} = require("@b5x/types");
const { z } = require("zod");

describe("Stats routes match expectations", () => {
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
      })
      .catch((e) => {
        throw e;
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // stats.listUsers ------------------------------------------------

  describe("stats.listUsers matches expectations", () => {
    let responseBody;

    test("stats.listUsers returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `stats.listUsers`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("stats.listUsers returns the correct data type", () => {
      const ResponseSchema = z.array(PublicUserWithStatsSchema);
      const validator = () => {
        ResponseSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });
  });

  // stats.listTopics -----------------------------------------------

  describe("stats.listTopics matches expectations", () => {
    let responseBody;

    test("stats.listTopics returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `stats.listTopics`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("stats.listTopics returns the correct data type", () => {
      const ResponseBodySchema = z.array(PublicTopicWithStatsSchema);
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });
});
