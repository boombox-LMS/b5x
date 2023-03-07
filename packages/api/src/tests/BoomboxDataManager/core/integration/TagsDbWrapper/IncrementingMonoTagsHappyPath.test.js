const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);

describe("Incrementing mono tags should work as expected on happy path", () => {
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

  let incrementedValue = 0;
  let incrementingTaggingId;

  test("User 1 should initially have no tags", async () => {
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags).toEqual([]);
  });

  test("Incrementing a nonexistent tag should set the tag as a mono tag", async () => {
    incrementedValue++;
    const firstIncrementedTag = await db.tags.increment({
      userId: 1,
      key: "incrementingKey",
    });
    incrementingTaggingId = firstIncrementedTag.taggingId;
    expect(firstIncrementedTag.value).toBe(incrementedValue);
    expect(firstIncrementedTag.mode).toBe("mono");
    const userTags = await db.tags.all({ userId: 1, key: "incrementingKey" });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(firstIncrementedTag);
  });

  test("Incremending an existing tag should add 1 to its value and recycle the tagging", async () => {
    incrementedValue++;
    const secondIncrementedTag = await db.tags.increment({
      userId: 1,
      key: "incrementingKey",
    });
    expect(secondIncrementedTag.value).toBe(incrementedValue);
    expect(secondIncrementedTag.taggingId).toEqual(incrementingTaggingId);
    const userTags = await db.tags.all({ userId: 1, key: "incrementingKey" });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(secondIncrementedTag);
  });
});
