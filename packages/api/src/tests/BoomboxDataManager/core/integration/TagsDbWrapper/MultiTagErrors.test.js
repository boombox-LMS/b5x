const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);
const { ZodError } = require("zod");

describe("Multi tag operations throw errors as expected", () => {
  let db;
  let testKey = "testkey1";

  // Seed the test database
  beforeAll(async () => {
    const knex = await global.buildKnexConnectionToTestDb();
    db = new BoomboxDataManager(knex);
    await db.seeder.seed({ users: [{ persona: "blank" }] });
    // create a mono tag to attempt to overwrite
    await db.tags.set({
      userId: 1,
      key: testKey,
      value: "testvalue1",
    });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await db.destroy();
  });

  // Not aiming to cover all cases, just a sanity check that
  // the Zod schema is still present and doing its job
  test("A multi tag cannot be created with bad params", async () => {
    const disallowedOperation = async () => {
      await db.tags.add({
        key: testKey,
        value: "testvalue1",
      });
    };
    expect(disallowedOperation).rejects.toThrow(ZodError);
  });

  test("A multi tag cannot be created with the same key as an existing mono tag", () => {
    const disallowedOperation = async () => {
      await db.tags.add({
        userId: 1,
        key: testKey,
        value: "testvalue1",
      });
    };
    expect(disallowedOperation).rejects.toThrow();
  });
});
