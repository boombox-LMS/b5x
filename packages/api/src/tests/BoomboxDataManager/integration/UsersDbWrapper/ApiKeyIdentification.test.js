const {
  BoomboxDataManager,
} = require("../../../../../dist/db/manager/BoomboxDataManager");

describe("Api keys function correctly", () => {
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

  const getApiKeyForUser = ({ username }) => {
    return db.knex
      .select("apiKey")
      .from("users")
      .where({ username })
      .limit(1)
      .then((rows) => {
        return rows[0].apiKey;
      });
  };

  const uuidLength = 36;
  const hashLength = 60;
  let username = "blank-1";
  let apiKey;

  test("User does not have an API key hash on file initially", async () => {
    const keyHash = await getApiKeyForUser({ username });
    expect(keyHash).toBe(null);
  });

  test("User can generate an API key", async () => {
    const assignmentResult = await db.users.assignApiKey({ username });
    apiKey = assignmentResult.apiKey;
    expect(apiKey.length).toEqual(uuidLength);
  });

  test("User now has an API key on file", async () => {
    const keyHash = await getApiKeyForUser({ username });
    expect(keyHash.length).toBe(hashLength);
  });

  test("User can verify their API key", async () => {
    const verificationResult = await db.users.verifyApiKey({
      username,
      apiKey,
    });
    expect(verificationResult).toBe(true);
  });
});
