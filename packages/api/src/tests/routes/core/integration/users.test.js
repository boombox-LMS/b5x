/**
 *  TODO: Test associated events / event queuing. Currently not included
 *  because the events logic is still rapidly changing.
 */
const supertest = require("supertest");

describe("User routes should work as expected on happy path", () => {
  let app;

  // Add a seeded test database to the app, available as app.get('db')
  // TODO: Make it possible to seed with no users at all, since we don't actually need any here
  beforeAll(async () => {
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app.get("db").destroy();
  });

  // AWKWARD: Counting stuff is weirdly difficult, would be helpful
  // to add a convenience method to db that can count stuff in tables
  test("A new user can log in, persist, and log out", async () => {
    let cookie = "";

    let beforeUserCount = await app.get("db").users.count();

    // log the user in
    await supertest(app)
      .post("/api/v1/users.logIn")
      .send({ email: "testuser1@test.com" })
      .expect(200)
      .then(async (response) => {
        let afterUserCount = await app.get("db").users.count();
        expect(beforeUserCount + 1).toEqual(afterUserCount);
        // propagate any cookie updates for next call
        cookie = global.getCookie(response) || cookie;
      })
      .catch((e) => {
        throw e;
      });

    // verify that the user is now logged in
    await supertest(app)
      .get("/api/v1/users.current")
      .set("Cookie", cookie)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toBe("testuser1@test.com");
        // propagate any cookie updates for next call
        cookie = global.getCookie(response) || cookie;
      })
      .catch((e) => {
        throw e;
      });

    // log the user out
    await supertest(app)
      .post("/api/v1/users.logOut")
      .set("Cookie", cookie)
      .expect(200)
      .then((response) => {
        // propagate any cookie updates for next call
        cookie = global.getCookie(response) || cookie;
      })
      .catch((e) => {
        throw e;
      });

    // verify that the user is logged out
    await supertest(app)
      .get("/api/v1/users.current")
      .set("Cookie", cookie)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toBe(null);
      })
      .catch((e) => {
        throw e;
      });
  });
});
