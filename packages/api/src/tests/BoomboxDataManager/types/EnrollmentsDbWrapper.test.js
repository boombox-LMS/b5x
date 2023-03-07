const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);
const { PublicEnrollmentSchema } = require("@b5x/types");

describe("Complex enrollments wrapper functions return the expected data types", () => {
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

  test(".find returns a valid PublicEnrollment", async () => {
    const result = await db.enrollments.find(testUserId, testTopicUri);
    const validator = () => {
      PublicEnrollmentSchema.parse(result);
    };
    expect(validator).not.toThrowError();
  });
});
