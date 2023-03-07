const supertest = require("supertest");

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
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // documents.contents ---------------------------------------------

  describe("documents.contents matches expectations", () => {
    let responseBody;

    test("documents.contents matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // documents.responses --------------------------------------------

  describe("documents.responses matches expectations", () => {
    let responseBody;

    test("documents.responses matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });

  // documents.verifyCompletion -------------------------------------

  describe("documents.verifyCompletion matches the snapshot on file", () => {
    let responseBody;

    test("documents.verifyCompletion matches the snapshot on file", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });
});
