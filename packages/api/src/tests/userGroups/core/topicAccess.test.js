const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);

let db;

// Seed the test database
beforeAll(async () => {
  const knex = await global.buildKnexConnectionToTestDb();
  db = new BoomboxDataManager(knex);
  await db.seeder.seed({
    users: [
      {
        email: "blocked-user@test.com",
        persona: "blank",
        groups: ["att-blocked"],
      },
      {
        email: "available-user@test.com",
        persona: "blank",
        groups: ["att-available"],
      },
      {
        email: "recommended-user@test.com",
        persona: "blank",
        groups: ["att-recommended"],
      },
      {
        email: "assigned-user@test.com",
        persona: "blank",
        groups: ["att-assigned"],
      },
    ],
  });
});

// Close the database connection, which allows Jest to exit gracefully
afterAll(async () => {
  await db.destroy();
});

// TODO: Nail down terminology around access vs. priority ...
// assignment and recommendation are a little bit different
// than an access permissions level, so maybe those two should be split out
// into their own category of designation
describe("Group access to topics should work correctly", () => {
  test("Each allowed user has the correct level of access", async () => {
    const accessLevels = ["available", "recommended", "assigned"];

    for (let i = 0; i < accessLevels.length; i++) {
      const accessLevel = accessLevels[i];
      const userEmail = `${accessLevel}-user@test.com`;

      // retrieve the user created to test this access level
      const user = await db
        .knex("users")
        .where({ email: userEmail })
        .then((rows) => {
          return rows[0];
        })
        .catch((e) => {
          throw e;
        });
      expect(user).not.toBe(undefined);

      // retrieve the user's catalog
      const catalog = await db.topics.getCatalog({ userId: user.id });

      // verify the access level
      let accessLevelVerified = false;
      catalog.topics.forEach((topic) => {
        if (
          topic.slug === "access-test-topic" &&
          topic.priorityLevel === accessLevel
        ) {
          accessLevelVerified = true;
        }
      });

      expect(accessLevelVerified).toBe(true);
    }
  });

  test("The disallowed user does not have access", async () => {
    // retrieve the user created to test this access level
    const user = await db
      .knex("users")
      .where({ email: "blocked-user@test.com" })
      .then((rows) => {
        return rows[0];
      })
      .catch((e) => {
        throw e;
      });
    expect(user).not.toBe(undefined);

    // retrieve the user's catalog
    const catalog = await db.topics.getCatalog({ userId: user.id });

    // verify the access level
    let accessLevelVerified = true;
    catalog.topics.forEach((topic) => {
      if (topic.slug === "access-test-topic") {
        accessLevelVerified = false;
      }
    });

    expect(accessLevelVerified).toBe(true);
  });
});

// TODO: Check content rights (reviewable, facilitated, owned), not just consumption rights
