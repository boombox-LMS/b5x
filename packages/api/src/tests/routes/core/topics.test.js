const supertest = require("supertest");
const { z } = require("zod");
const {
  PublicCatalogSchema,
  TopicWithEnrollmentInfoSchema,
  PublicTopicSchema,
  PublicEnrollmentSchema,
} = require("@b5x/types");

describe("Topics routes should match expectations", () => {
  let app;
  let cookie = "";
  let testTopicUri = global.SMOKE_TEST_TOPIC_URI;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });

    // Log the user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: "completed-1@test.com" })
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

  // topics.catalog -------------------------------------------------

  describe("topics.catalog matches expectations", () => {
    let responseBody;

    test("topics.catalog returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + "topics.catalog")
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("topics.catalog returns the correct data type", () => {
      const validator = () => {
        PublicCatalogSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });
  });

  // topics.info ----------------------------------------------------

  describe("topics.info matches expectations", () => {
    let responseBody;

    test("topics.info returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.info?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("topics.info returns the correct data type", () => {
      const validator = () => {
        TopicWithEnrollmentInfoSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });
  });

  test("topics.info throws an error if the user tries to access a forbidden topic", async () => {
    const forbiddenTopicUri = "access-test-topic-vseed";
    await supertest(app)
      .get(apiPrefix + `topics.info?uri=${forbiddenTopicUri}`)
      .set("Cookie", cookie)
      .expect(403)
      .then((res) => {
        expect(res.body).toMatchSnapshot();
      })
      .catch((e) => {
        throw e;
      });
  });

  // topics.contents ------------------------------------------------

  describe("topics.contents matches expectations", () => {
    let responseBody;

    test("topics.contents returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.contents?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("topics.contents returns a 422 when given an invalid data schema", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.contents?uri=undefined`)
        .set("Cookie", cookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });

    test("topics.contents returns the correct data type", () => {
      const validator = () => {
        PublicTopicSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });
  });

  // topics.publish -------------------------------------------------
  describe("topics.publish matches expectations", () => {
    // parse the smoke test topic under a new slug
    // count the entities in the compiled topic data
    // publish the smoke test topic again
    test.todo("topics.publish returns a 200");
    // verify that the correct number of entities were created
    test.todo("topics.publish creates the expected entities");
  });

  // topics.enrollment + topics.verifyCompletion --------------------

  describe("topics.enrollment and topics.verifyCompletion match expectations", () => {
    let enrollmentResponseBody;
    let completionResponseBody;

    test("topics.enrollment and topics.verifyCompletion return a 200", async () => {
      // trigger enrollment creation
      await supertest(app)
        .get(apiPrefix + `topics.enrollment?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          enrollmentResponseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });

      // verify topic completion
      await supertest(app)
        .post(apiPrefix + "topics.verifyCompletion")
        .set("Cookie", cookie)
        .send({ topicUri: testTopicUri })
        .expect(200)
        .then((res) => {
          completionResponseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("topics.enrollment returns the correct data type", () => {
      const ResponseBodySchema = PublicEnrollmentSchema.extend({
        topicUri: z.literal(testTopicUri),
      });
      const validator = () => {
        ResponseBodySchema.parse(enrollmentResponseBody);
      };
      expect(validator).not.toThrowError();
    });

    test("topics.verifyCompletion returns the correct data type", () => {
      const ResponseBodySchema = z.object({
        topicUri: z.literal(testTopicUri),
        topicIsCompleted: z.literal(true),
      });

      const validator = () => {
        ResponseBodySchema.parse(completionResponseBody);
      };
      expect(validator).not.toThrowError();
    });
  });
});
