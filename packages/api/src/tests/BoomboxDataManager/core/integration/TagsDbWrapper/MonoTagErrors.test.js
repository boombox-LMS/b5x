const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);

describe("Mono tag operations throw errors as expected", () => {
  let db;

  // Seed the test database
  beforeAll(async () => {
    const knex = await global.buildKnexConnectionToTestDb();
    db = new BoomboxDataManager(knex);
    await db.seeder.seed({ users: [{ persona: "blank" }] });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await db.destroy();
  });

  test.todo(
    "A mono tag cannot be created with the same key as an existing multi tag"
  );

  test.todo(
    "A mono tag cannot be incremented using the same key as an existing mono tag"
  );

  test.todo("A valid taggableId must be provided when creating a mono tag");
});
