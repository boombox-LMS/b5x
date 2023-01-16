const knexConfig = require("../db/knexfile");
import { ExtendedKnex } from "./ExtendedKnex";
const Knex = require("Knex");
const KnexStringcase = require("knex-stringcase");
const _ = require("lodash");
const crypto = require("crypto");
const { createClient } = require("redis");
require("dotenv").config({ path: __dirname + "/../../.env" });
const timestampMigration = require("../db/migrations/20220115200739_createTimestampTrigger");
const tableCreationMigration = require("../db/migrations/20220115201336_createKeyTables");

// TODO: Write a more general package that will build a migration source
// from the migrations folder, no matter what files are in there ...
// or maybe use https://www.npmjs.com/package/knex-migrator ?
class TestMigrationSource {
  // Must return a Promise containing a list of migrations.
  // Migrations can be whatever you want,
  // they will be passed as arguments to getMigrationName
  // and getMigration
  getMigrations() {
    // In this example we are just returning migration names
    return Promise.resolve(["timestampMigration", "tableCreationMigration"]);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  getMigration(migration: string) {
    switch (migration) {
      case "timestampMigration":
        return timestampMigration;
      case "tableCreationMigration":
        return tableCreationMigration;
    }
  }
}

/**
 *  Responsible for creating and configuring a knex client
 *  that is connected to a Postgres database
 *  and a redis instance (to enable chaining the
 *  .cache() function onto knex queries
 *  when desired).
 *
 *  Can also create a new test database when desired,
 *  and run any existing migrations on it.
 *
 *  @example
 *  const knex = new DatabaseConnectionBuilder("test").createKnexConnection()
 *  // The above knex client can then be ...
 *  // - used to interact directly with the database,
 *  // - passed into a new instance of BoomboxDataManager for more convenient
 *  // seeding or querying, or
 *  // - passed into the AppBuilder constructor to create
 *  // an instance of the Boombox server application that is connected to the
 *  // test database
 */
export class DatabaseConnectionBuilder {
  /**
   *  The Redis client instance that should be used
   *  to cache Knex queries where desired.
   */
  redis: any;
  env: "test" | "development";
  /**
   *  Can manually be set to true inside the constructor
   *  for ongoing verbose debugging output
   *  from any knex clients created by this instance.
   */
  connectionDebug: boolean;
  /**
   *  A consistent prefix used in test database names
   *  to allow test databases to be detected in bulk
   *  (and deleted in bulk).
   */
  testDbPrefix: string | undefined; // TODO: Awkward

  constructor(env: "test" | "development") {
    let redis;
    (async () => {
      redis = createClient();
      redis.on("error", (err: Error) => console.log("Redis Client Error", err));
      await redis.connect();
    })();
    this.redis = redis;
    this.env = env;
    this.connectionDebug = false;
    this.testDbPrefix = process.env.TEMPORARY_TEST_DATABASE_PREFIX;
  }

  /**
   *  @returns A knex client that can be used to interact with the
   *  dev database or a test database, depending on the env.
   */
  createKnexConnection() {
    return new Promise(async (resolve) => {
      if (this.env === "test") {
        const knex = await this.#buildTestDatabaseConnection();
        resolve(knex);
      } else if (this.env === "development") {
        resolve(this.#buildDevDatabaseConnection());
      }
    });
  }

  /**
   *  Creates a new test database in Postgres,
   *  runs migrations on it to create Boombox tables,
   *  and sets up a knex connection.
   *
   *  @returns A knex client that can be used to interact with the new test database.
   */
  async #buildTestDatabaseConnection() {
    // make initial connection to Postgres
    const dbConnectionConfig = knexConfig["test"];
    let connection = KnexStringcase(dbConnectionConfig);
    connection.debug = this.connectionDebug;
    let knex = Knex(connection);

    // generate name for temporary test database
    let tempDbConnectionConfig = _.cloneDeep(dbConnectionConfig);
    const tempDbName =
      this.testDbPrefix + crypto.randomUUID().replace(/-/g, "x");
    tempDbConnectionConfig.connection.database = tempDbName;

    // create temporary database
    // TODO: avoid hardcoding db template name
    await knex.raw(`CREATE DATABASE ${tempDbName}`);

    // disconnect from Postgres
    await knex.destroy();

    // connect to temporary database
    connection = KnexStringcase(tempDbConnectionConfig);
    connection.debug = this.connectionDebug;
    knex = ExtendedKnex(connection);
    await knex.migrate.latest({
      migrationSource: new TestMigrationSource(),
    });
    knex.setRedis(this.redis);

    return knex;
  }

  #buildDevDatabaseConnection() {
    const dbConnectionConfig = knexConfig["development"];
    const connection = KnexStringcase(dbConnectionConfig);
    connection.debug = this.connectionDebug;
    const knex = ExtendedKnex(connection);
    // set Redis for caching purposes
    knex.setRedis(this.redis);
    return knex;
  }
}

// For compatibility with tests
module.exports = { DatabaseConnectionBuilder };
