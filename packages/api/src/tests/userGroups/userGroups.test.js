const {
  BoomboxDataManager,
} = require("../../../dist/db/manager/BoomboxDataManager");

let db;

jest.setTimeout(15000);

// Seed the test database
beforeAll(async () => {
  const knex = await global.buildKnexConnectionToTestDb();
  db = new BoomboxDataManager(knex);
  await db.seeder.seed({
    users: [
      {
        email: "test-manager@test.com",
        persona: "blank",
        groups: ["managers"],
      },
    ],
  });
});

// Close the database connection, which allows Jest to exit gracefully
afterAll(async () => {
  await db.destroy();
});

describe("User groups should work correctly", () => {
  test("The seeded user's tags should include the correct group tag", async () => {
    // look up the user to get their ID
    const user = await db
      .knex("users")
      .where({ email: "test-manager@test.com" })
      .then((rows) => {
        return rows[0];
      });

    // verify the existence of the user
    expect(user).not.toBe(undefined);

    // look up the user's tags
    const tags = await db.tags.all({ userId: user.id });

    // search the tags for the correct key-value pair
    let matchFound = false;
    tags.forEach((tag) => {
      // TODO: move hardcoded string value to config
      if (tag.key === "user-group" && tag.value === "managers") {
        matchFound = true;
      }
    });

    expect(matchFound).toBe(true);
  });
});
