const supertest = require("supertest");

describe("Topic registration flow is operational", () => {
  let app;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;
  let initialTopicCount;

  // Add a seeded test database to the app, available as app.get('db')
  // TODO: Make it possible to seed with no users at all, since we don't actually need any here
  beforeAll(async () => {
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });
    initialTopicCount = await app.get("db").topics.count();
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  test("topics.register allows registration of unique slug", async () => {
    await supertest(app)
      .post(apiPrefix + `topics.register`)
      .send({ slug: "brand-new-topic-slug" })
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchSnapshot();
      })
      .catch((e) => {
        throw e;
      });
  });

  test("topics.register creates a new topic when given a unique slug", async () => {
    const newTopicCount = await app.get("db").topics.count();
    expect(newTopicCount).toEqual(initialTopicCount + 1);
  });

  test("topics.register rejects duplicate slug registration", async () => {
    await supertest(app)
      .post(apiPrefix + `topics.register`)
      .send({ slug: "brand-new-topic-slug" })
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchSnapshot();
      })
      .catch((e) => {
        throw e;
      });
  });
});
