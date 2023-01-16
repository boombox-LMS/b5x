const {
  BoomboxDataManager,
} = require("../../../../dist/db/manager/BoomboxDataManager");
const {
  CatalogSchema,
  SavedTopicSchema,
  TopicInfoSchema,
  ExpandedTopicSchema,
} = require("@b5x/types");

describe("Complex topics wrapper functions return the expected data types", () => {
  let db;
  let testUserId;
  const testTopicUri = "smoke-testing-vseed";

  // Seed the test database
  beforeAll(async () => {
    const knex = await global.buildKnexConnectionToTestDb();
    db = new BoomboxDataManager(knex);
    await db.seeder.seed({ users: [{ persona: "completed" }] });
    await db.knex
      .select("id")
      .from("users")
      .then((rows) => {
        testUserId = rows[0].id;
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await db.destroy();
  });

  test(".getCatalog returns a valid Catalog", async () => {
    const result = await db.topics.getCatalog({ userId: testUserId });
    const validator = () => {
      CatalogSchema.parse(result);
    };
    expect(validator).not.toThrowError();
  });

  test(".info returns a valid TopicInfo object", async () => {
    const result = await db.topics.info({ uri: testTopicUri });
    const validator = () => {
      TopicInfoSchema.parse(result);
    };
    expect(validator).not.toThrowError();
  });

  test.todo(".publish returns a valid ExpandedTopic");
  test.todo(".updateAccessRules returns a valid SavedTopic");
});
