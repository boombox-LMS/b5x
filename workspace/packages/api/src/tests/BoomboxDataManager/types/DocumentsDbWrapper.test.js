const {
  BoomboxDataManager,
} = require("../../../../dist/db/manager/BoomboxDataManager");
const { DocumentContentsSchema } = require("@b5x/types");

describe("Complex documents wrapper functions return the expected data types", () => {
  let db;
  const testDocumentUri = "smoke-testing-vseed_basic-topic-functionality";

  // Seed the test database
  beforeAll(async () => {
    const knex = await global.buildKnexConnectionToTestDb();
    db = new BoomboxDataManager(knex);
    await db.seeder.seed({ users: [{ persona: "completed" }] });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await db.destroy();
  });

  test(".getContents returns a valid DocumentContents", async () => {
    const result = await db.documents.getContents({
      documentUri: testDocumentUri,
    });
    const validator = () => {
      DocumentContentsSchema.parse(result);
    };
    expect(validator).not.toThrowError();
  });
});
