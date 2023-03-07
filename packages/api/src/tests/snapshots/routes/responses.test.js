const supertest = require("supertest");
const { UserResponseSchema } = require("@b5x/types");

describe("Responses routes should match expectations", () => {
  let app;
  let cookie = "";
  let response;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });

    // TODO: Find a suitable response to modify and resend
    response = await app
      .get("db")
      .knex.select(
        "responses.fragmentRefUri AS fragmentUri",
        "responses.enrollmentId AS enrollmentId",
        "responses.value AS value"
      )
      .from("responses")
      .leftJoin("fragmentRefs", "fragmentRefs.uri", "responses.fragmentRefUri")
      .leftJoin(
        "fragmentExcerpts",
        "fragmentExcerpts.id",
        "fragmentRefs.fragmentExcerptId"
      )
      .where("fragmentExcerpts.contentType", "=", "ShortTextQuestion")
      .limit(1)
      .then((rows) => {
        return rows[0];
      });

    response.value = response.value + " (edited to add: this text right here)";
    response.status = "completed";

    // Log in as the user who posted the original response
    let userEmail = await app
      .get("db")
      .knex.select("users.email")
      .from("users")
      .leftJoin("enrollments", "enrollments.userId", "users.id")
      .where("enrollments.id", "=", response.enrollmentId)
      .then((rows) => {
        return rows[0].email;
      });

    // Log the user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: userEmail })
      .expect(200)
      .then((res) => {
        // Save the cookie to send with later requests
        cookie = global.getCookie(res) || cookie;
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // responses.create -----------------------------------------------

  describe("responses.create matches the snapshot", () => {
    let responseBody;

    test("responses.create returns a response", async () => {
      await supertest(app)
        .post(apiPrefix + "responses.create")
        .set("Cookie", cookie)
        .send({ ...response })
        .then((res) => {
          responseBody = res.body;
        });
    });

    test("response.create matches the snapshot", () => {
      expect(responseBody).toMatchSnapshot();
    });
  });
});
