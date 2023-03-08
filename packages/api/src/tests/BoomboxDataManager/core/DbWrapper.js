const DbWrapper = require("../../db/dataManager/private/subwrappers/DbWrapper");

let knex;
let db;

// Seed the test database
beforeAll(async () => {
  knex = await global.buildKnexConnectionToTestDb();
  db = new BoomboxDataManager({ knex });
  await db.seeder.seed({ users: "default" });
});

// Close the database connection, which allows Jest to exit gracefully
afterAll(async () => {
  await db.destroy();
});

test("documents.count returns the correct number of documents", async () => {
  const dbWrapper = new DbWrapper({ knex, tableName: "documents" });
  let promises = [];

  // get the official count from knex
  promises.push(
    knex("documents")
      .count("id")
      .then((rows) => {
        count = rows[0].count;
        return parseInt(count);
      })
      .catch((e) => {
        throw e;
      })
  );

  // get the corresponding count from the dbWrapper
  promises.push(dbWrapper.count());

  // compare the two counts to verify that they match
  Promise.all(promises).then(([knexCount, dbWrapperCount]) => {
    expect(knexCount).toBe(dbWrapperCount);
  });
});
