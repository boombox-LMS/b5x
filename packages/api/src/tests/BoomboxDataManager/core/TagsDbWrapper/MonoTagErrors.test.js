const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);
const { ZodError } = require("zod");

describe("Mono tag operations throw errors as expected", () => {
  let db;
  let testKey = "testkey1";

  // Seed the test database
  beforeAll(async () => {
    const knex = await global.buildKnexConnectionToTestDb();
    db = new BoomboxDataManager(knex);
    await db.seeder.seed({ users: [{ persona: "blank" }] });
    // create a multi tag to attempt to overwrite
    await db.tags.add({
      userId: 1,
      key: testKey,
      value: "testvalue1",
    });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await db.destroy();
  });

  test("A mono tag cannot be created with the same key as an existing multi tag", async () => {
    const disallowedOperation = async () => {
      await db.tags.set({
        userId: 1,
        key: testKey,
        value: "testvalue1",
      });
    };
    expect(disallowedOperation()).rejects.toThrow();
  });
});
