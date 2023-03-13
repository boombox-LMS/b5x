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
  let completedUserCookie = "";
  let variableCatalogUserCookie = "";
  const forbiddenTopicUri = "access-test-topic-vseed";
  let testTopicUri = global.SMOKE_TEST_TOPIC_URI;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }, { persona: "variable-catalog" }],
    });

    // Log the completed user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: "completed-1@test.com" })
      .then((res) => {
        // Save the cookie to send with later requests
        completedUserCookie = global.getCookie(res) || completedUserCookie;
      })
      .catch((e) => {
        throw e;
      });

    // Log the variable catalog user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: "variable-catalog-1@test.com" })
      .then((res) => {
        // Save the cookie to send with later requests
        variableCatalogUserCookie =
          global.getCookie(res) || variableCatalogUserCookie;
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

    test.todo(
      "topics.getCatalog lists unmet prerequisites correctly when they are present"
    );

    test("topics.catalog returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + "topics.catalog")
        .set("Cookie", completedUserCookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("topics.catalog returns the correct data type for a completed user", () => {
      const validator = () => {
        PublicCatalogSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });

    test("topics.catalog returns the correct data type for a variable catalog user", async () => {
      let variableCatalogResponseBody;

      await supertest(app)
        .get(apiPrefix + "topics.catalog")
        .set("Cookie", variableCatalogUserCookie)
        .expect(200)
        .then((res) => {
          variableCatalogResponseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });

      const validator = () => {
        PublicCatalogSchema.parse(variableCatalogResponseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // topics.info ----------------------------------------------------

  describe("topics.info matches expectations when given a valid value", () => {
    let responseBody;

    test("topics.info returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.info?uri=${testTopicUri}`)
        .set("Cookie", completedUserCookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });
  });

  describe("topics.info refuses invalid query data", () => {
    test("it returns a 422 when no slug or uri is present", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.info?uri=undefined`)
        .set("Cookie", completedUserCookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });

    test("it returns a 422 when both the slug and uri are present", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.info?uri=fakeTopicUri&slug=fakeTopicSlug`)
        .set("Cookie", completedUserCookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });
  });

  test("topics.info throws an error if the user tries to access a forbidden topic", async () => {
    await supertest(app)
      .get(apiPrefix + `topics.info?uri=${forbiddenTopicUri}`)
      .set("Cookie", completedUserCookie)
      .expect(403)
      .then((res) => {
        expect(res.body).toMatchSnapshot();
      })
      .catch((e) => {
        throw e;
      });
  });

  test.todo(
    "topics.verifyCompletion should return false if the topic does not pass the completion check"
  );

  // topics.contents ------------------------------------------------

  describe("topics.contents matches expectations", () => {
    let responseBody;

    test("topics.contents returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.contents?uri=${testTopicUri}`)
        .set("Cookie", completedUserCookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
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

    test("topics.contents returns 403 if the user does not have access to the topic", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.contents?uri=${forbiddenTopicUri}`)
        .set("Cookie", completedUserCookie)
        .expect(403)
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
        .set("Cookie", completedUserCookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
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

  describe("topics.enrollment and topics.verifyCompletion match expectations when given valid input", () => {
    let enrollmentResponseBody;
    let completionResponseBody;

    test("topics.enrollment and topics.verifyCompletion return a 200", async () => {
      // trigger enrollment creation
      await supertest(app)
        .get(apiPrefix + `topics.enrollment?uri=${testTopicUri}`)
        .set("Cookie", completedUserCookie)
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
        .set("Cookie", completedUserCookie)
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

  describe("topics.verifyCompletion refuses bad input", () => {
    test("topics.verifyCompletion should return 422 if the topicUri is undefined", async () => {
      await supertest(app)
        .post(apiPrefix + "topics.verifyCompletion")
        .set("Cookie", completedUserCookie)
        .send({ topicUri: undefined })
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });
  });

  describe("topics.enrollment refuses bad input", () => {
    test("topics.enrollment should return 422 if the uri is undefined", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.enrollment?uri=undefined`)
        .set("Cookie", completedUserCookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });
  });
});
