/**
 *  Verifies the consistency of the seeding module's output
 *  using snapshots of each seeded table in the database.
 */

const {
  BoomboxDataManager,
} = require(`${global.DIST_PATH}/db/manager/BoomboxDataManager`);

// TODO: Add skipped keys to data-sanitizer
// to preserve user-authored id fields etc.
const { sanitizeFields } = require("data-sanitizer");

jest.setTimeout(15000);

let db;

const tableNames = [
  "topics",
  "accessRules",
  "documents",
  "fragmentRefs",
  "fragmentExcerpts",
  "tags",
  "taggings",
  "users",
  "responses",
  "enrollments",
  "events",
  "tickets",
];

const foreignKeyFieldsByTableName = {
  fragmentRefs: ["fragmentExcerptId"],
  responses: ["fragmentRefId"],
  events: ["fragments"],
};

const additionalFieldsToSanitizeByTableName = {
  tickets: ["key"],
};

let sanitizationResultByTableName = {};

beforeAll(async () => {
  // create and seed the test databases
  const knex = await global.buildKnexConnectionToTestDb();
  db = new BoomboxDataManager(knex);
  await db.seeder.seed({ users: "default", skipFillerTopics: true });

  // load all table data asynchronously
  let tableQueryPromises = [];
  for (let i = 0; i < tableNames.length; i++) {
    const tableName = tableNames[i];
    tableQueryPromises.push(
      db
        .knex(tableName)
        .orderBy("id")
        .then((rows) => {
          // sanitize the data
          const foreignKeyFields = foreignKeyFieldsByTableName[tableName] || [];
          const additionalFieldsToSanitize =
            additionalFieldsToSanitizeByTableName[tableName] || [];
          sanitizationResultByTableName[tableName] = sanitizeFields({
            data: rows,
            fieldNames: foreignKeyFields
              .concat(["createdAt", "updatedAt", "id"])
              .concat(additionalFieldsToSanitize),
          });
        })
        .catch((e) => {
          throw e;
        })
    );
  }
  await Promise.all(tableQueryPromises);
});

afterAll(async () => {
  await db.destroy();
});

describe("The seeded data matches the snapshots", () => {
  tableNames.forEach((tableName) => {
    // check sanitized row data
    test(`The sanitized ${tableName} data matches the snapshot`, () => {
      const sanitizationResult = sanitizationResultByTableName[tableName];
      expect(sanitizationResult.data).toMatchSnapshot();
    });

    // check row IDs
    test(`The row IDs in the ${tableName} data match the snapshot`, () => {
      const sanitizationResult = sanitizationResultByTableName[tableName];
      const idsOneLiner = sanitizationResult.removedValues.id.join("|");
      expect(idsOneLiner).toMatchSnapshot();
    });

    // check any foreign keys
    const foreignKeyFields = foreignKeyFieldsByTableName[tableName];
    if (foreignKeyFields) {
      foreignKeyFields.forEach((foreignKeyFieldName) => {
        test(`The ${foreignKeyFieldName} field in the ${tableName} data matches the snapshot`, () => {
          const sanitizationResult = sanitizationResultByTableName[tableName];
          const foreignKeyOneLiner =
            sanitizationResult.removedValues[foreignKeyFieldName].join("|");
          expect(foreignKeyOneLiner).toMatchSnapshot();
        });
      });
    }
  });
});
