/**
 *  This will run once -- once total,
 *  not once per test/file/suite -- after Jest runs any tests.
 */

require("dotenv").config({ path: __dirname + "/../../../.env" });
const knexConfig = require("../../../dist/db/knexfile");
const Knex = require("knex");
const KnexStringcase = require("knex-stringcase");

const globalTeardown = async () => {
  // connect to knex
  const dbConnectionConfig = knexConfig["test"];
  let connection = KnexStringcase(dbConnectionConfig);
  // connection.debug = this.connectionDebug
  let knex = Knex(connection);

  // get list of test databases
  // TODO: Avoid hardcoded temporary database matcher
  const testDbPrefix = process.env.TEMPORARY_TEST_DATABASE_PREFIX;
  const testDbQueryResult = await knex.raw(
    `select datname from pg_database where datname like '${testDbPrefix}%'`
  );

  // delete all databases
  let deletionPromises = [];
  testDbQueryResult.rows.forEach((row) => {
    const testDbName = row.datname;
    deletionPromises.push(knex.raw(`DROP DATABASE ${testDbName}`));
  });

  // close the connection when finished
  Promise.all(deletionPromises)
    .then(() => {
      knex.destroy();
    })
    .catch((e) => {
      throw e;
    });
};

module.exports = globalTeardown;
