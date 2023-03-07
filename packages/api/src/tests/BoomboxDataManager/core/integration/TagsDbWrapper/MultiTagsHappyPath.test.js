const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);

describe("Multi-tags should work as expected on happy path", () => {
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

  let firstUserTag;
  let secondUserTag;

  // all (no tags available)
  test("User 1 should have no tags initially", async () => {
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags).toEqual([]);
  });

  // add (no existing tag)
  test("Adding a tag to user 1 should create and return a multi tag", async () => {
    firstUserTag = await db.tags.add({
      userId: 1,
      key: "testkey1",
      value: "testvalue1",
    });
    expect(firstUserTag.key).toBe("testkey1");
    expect(firstUserTag.value).toBe("testvalue1");
    expect(firstUserTag.mode).toBe("multi");
  });

  // all (1 existing tag)
  test("After adding a tag, tags.all() should include the tag", async () => {
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(firstUserTag);
  });

  // add (idempotent)
  test("Adding the same tag again should still return the original first tag", async () => {
    idempotentlyAddedUserTag = await db.tags.add({
      userId: 1,
      key: "testkey1",
      value: "testvalue1",
    });
    expect(idempotentlyAddedUserTag).toEqual(firstUserTag);
  });

  // add (additional tag)
  test("Adding a new tag with the same key should preserve both tags", async () => {
    secondUserTag = await db.tags.add({
      userId: 1,
      key: "testkey1",
      value: "testvalue2",
    });
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(2);
    expect(userTags[0]).toEqual(firstUserTag);
    expect(userTags[1]).toEqual(secondUserTag);
  });

  // remove (single tag)
  test("Removing a specific key-value pair should leave other tags intact", async () => {
    // delete first user tag
    await db.tags.remove({ userId: 1, key: "testkey1", value: "testvalue1" });
    // verify that second user tag is still present
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(secondUserTag);
  });

  // remove (multiple tags)
  test("Removing a key should delete all taggings with that key", async () => {
    // add another tag so we have multiple tags to remove
    const thirdUserTag = await db.tags.add({
      userId: 1,
      key: "testkey1",
      value: "testvalue3",
    });
    // add a tag that should remain, just to verify correct behavior
    const fourthUserTag = await db.tags.add({
      userId: 1,
      key: "testkey2",
      value: "testvalue4",
    });
    await db.tags.remove({ userId: 1, key: "testkey1" });
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags.length).toBe(1);
    expect(userTags[0]).toEqual(fourthUserTag);
  });

  // remove (all tags)
  test("Removing all tags should empty the user's tags array", async () => {
    const fifthUserTag = await db.tags.add({
      userId: 1,
      key: "testkey3",
      value: "testvalue5",
    });
    const sixthUserTag = await db.tags.add({
      userId: 1,
      key: "testkey4",
      value: "testvalue6",
    });
    const seventhUserTag = await db.tags.add({
      userId: 1,
      key: "testkey5",
      value: "testvalue7",
    });
    await db.tags.remove({ userId: 1, confirmRemoveAll: true });
    const userTags = await db.tags.all({ userId: 1 });
    expect(userTags).toEqual([]);
  });
});
