const {
  BoomboxDataManager,
} = require("../../../../../dist/db/manager/BoomboxDataManager");

describe("Setting mono tags should work as expected on happy path", () => {
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

  let monoTag;

  test("User 1 should initially have no tags", async () => {
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags).toEqual([]);
  });

  test("Setting a nonexistent tag should create the tag as a mono tag", async () => {
    monoTag = await db.tags.set({ userId: 1, key: "key1", value: "value1" });
    expect(monoTag.mode).toBe("mono");
    expect(monoTag.key).toBe("key1");
    expect(monoTag.value).toBe("value1");
  });

  test("After adding a mono tag, it should be included in tags.all()", async () => {
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(monoTag);
  });

  test("Setting an already existing tag to the same value should return the originally created mono tag", async () => {
    const secondMonoTagAttempt = await db.tags.set({
      userId: 1,
      key: "key1",
      value: "value1",
    });
    expect(secondMonoTagAttempt).toEqual(monoTag);
  });

  test("Setting an existing tag to a new value should update the tagging with the new tag ID", async () => {
    const updatedMonoTag = await db.tags.set({
      userId: 1,
      key: "key1",
      value: "value2",
    });
    // the same tagging should be recycled
    expect(updatedMonoTag.taggingId).toEqual(monoTag.taggingId);
    // the tag id should have changed, though
    expect(updatedMonoTag.id).not.toBe(monoTag.id);
    // ... and there should only be one user tag returned by all()
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(updatedMonoTag);
  });
});
