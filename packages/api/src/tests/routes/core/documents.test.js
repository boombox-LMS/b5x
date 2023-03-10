const supertest = require("supertest");
const { z } = require("zod");
const { DocumentContentsSchema, UserResponseSchema } = require("@b5x/types");

describe("Documents routes should return a 200", () => {
  let app;
  let cookie;
  let testDocumentUri;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });

    // TODO: Have seeding functionality in the parser to keep all of these URIs consistent
    // even as the demo content is updated
    testDocumentUri = global.FIRST_SMOKE_TEST_TOPIC_DOCUMENT_URI;

    // Log the user in (someone who has completed all topics)
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

  // documents.contents ---------------------------------------------

  describe("documents.contents matches expectations", () => {
    let responseBody;

    test("documents.contents returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.contents?documentUri=${testDocumentUri}`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.contents returns a 422 if an invalid data schema is sent", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.contents?badKey=badValue`)
        .set("Cookie", cookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });

    test("documents.contents returns the correct data type", () => {
      const validator = () => {
        DocumentContentsSchema.parse(responseBody);
      };
      expect(validator).not.toThrowError();
    });
  });

  // documents.responses --------------------------------------------

  describe("documents.responses matches expectations", () => {
    let responseBody;

    test("documents.responses returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.responses?documentUri=${testDocumentUri}`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.responses returns a 422 if an invalid data schema is sent", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.responses?badKey=badValue`)
        .set("Cookie", cookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });

    test("documents.responses returns the correct data type", () => {
      // TODO: Not sure why this fails when a minimum length string key is defined
      const ResponseBodySchema = z.record(UserResponseSchema);
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // documents.verifyCompletion -------------------------------------

  describe("documents.verifyCompletion matches expectations", () => {
    let responseBody;

    test("documents.verifyCompletion returns a 200", async () => {
      await supertest(app)
        .post(apiPrefix + `documents.verifyCompletion`)
        .send({ documentUri: testDocumentUri })
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.verifyCompletion returns a 422 when given a bad data schema", async () => {
      await supertest(app)
        .post(apiPrefix + `documents.verifyCompletion`)
        .send({ badKey: "badValue" })
        .set("Cookie", cookie)
        .expect(422)
        .catch((e) => {
          throw e;
        });
    });

    test("documents.verifyCompletion returns the correct data type", () => {
      const ResponseBodySchema = z.object({
        documentUri: z.string().min(1),
        documentIsCompleted: z.boolean(),
      });
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });
});
