const supertest = require("supertest");

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
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // topics.catalog -------------------------------------------------

  describe("topics.catalog matches the snapshot", () => {
    let responseBody;

    test("topics.catalog returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + "topics.catalog")
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("topics.catalog matches the snapshot", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // topics.info ----------------------------------------------------

  describe("topics.info matches expectations", () => {
    let responseBody;

    test("topics.info returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.info?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("topics.info matches the snapshot on file", async () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // topics.contents ------------------------------------------------

  describe("topics.contents matches the snapshot", () => {
    let responseBody;

    test("topics.contents returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `topics.contents?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("topics.contents matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // topics.enrollment + topics.verifyCompletion --------------------

  describe("topics.enrollment and topics.verifyCompletion match the snapshot", () => {
    let enrollmentResponseBody;
    let completionResponseBody;

    test("topics.enrollment and topics.verifyCompletion return a response", async () => {
      // trigger enrollment creation
      await supertest(app)
        .get(apiPrefix + `topics.enrollment?uri=${testTopicUri}`)
        .set("Cookie", cookie)
        .then((res) => {
          enrollmentResponseBody = res.body;
        });

      // verify topic completion
      await supertest(app)
        .post(apiPrefix + "topics.verifyCompletion")
        .set("Cookie", cookie)
        .send({ topicUri: testTopicUri })
        .then((res) => {
          completionResponseBody = res.body;
        });
    });

    test("topics.enrollment matches the snapshot", () => {
      expect(enrollmentResponseBody).toMatchSnapshot();
    });

    test("topics.verifyCompletion matches the snapshot", () => {
      expect(completionResponseBody).toMatchSnapshot();
    });
  });
});
