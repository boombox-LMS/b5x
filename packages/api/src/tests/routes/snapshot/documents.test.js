const supertest = require("supertest");

describe("Documents routes should match their snapshots", () => {
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
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });
  // documents.contents ---------------------------------------------

  describe("documents.contents matches the snapshot", () => {
    let responseBody;

    test("documents.contents returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.contents?documentUri=${testDocumentUri}`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.contents matches the snapshot", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // documents.responses --------------------------------------------

  describe("documents.responses matches the snapshot", () => {
    let responseBody;

    test("documents.responses returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `documents.responses?documentUri=${testDocumentUri}`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.responses matches the snapshot", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // documents.verifyCompletion -------------------------------------

  describe("documents.verifyCompletion matches the snapshot", () => {
    let responseBody;

    test("documents.verifyCompletion returns a response", async () => {
      await supertest(app)
        .post(apiPrefix + `documents.verifyCompletion`)
        .send({ documentUri: testDocumentUri })
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("documents.verifyCompletion matches the snapshot", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });
});
