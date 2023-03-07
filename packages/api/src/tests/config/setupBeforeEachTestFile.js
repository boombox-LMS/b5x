/**
 *  This will run once before each file.
 */

const DIST_PATH = __dirname + "/../../../dist";
global.DIST_PATH = DIST_PATH;

global.__SUPERTEST_API_PREFIX__ = "/api/v1/";

const knexConfig = require(`${DIST_PATH}/db/knexfile`);
global.__TEST_DB_CONNECTION_CONFIG__ = knexConfig["test"];
const {
  DatabaseConnectionBuilder,
} = require(`${DIST_PATH}/db/DatabaseConnectionBuilder`);
const { AppBuilder } = require(`${DIST_PATH}/AppBuilder`);

global.buildKnexConnectionToTestDb = async () => {
  const dbConnectionBuilder = new DatabaseConnectionBuilder("test");
  const knex = await dbConnectionBuilder.createKnexConnection();
  return knex;
};

// TODO: Enable custom topicFiles
global.buildAppWithSeededTestDatabase = async ({ users }) => {
  let app;

  // generate temporary test database and connect to it
  const knex = await global.buildKnexConnectionToTestDb();

  // instantiate server app with database connection
  const appBuilder = new AppBuilder(knex);
  app = appBuilder.app;

  // ensure that redis loads
  await app.get("db").knex.client.redis;

  // seed the database
  await app.get("db").seeder.seed({ users });

  return app;
};

global.getCookie = (res) => {
  if (res.headers["set-cookie"]) {
    const cookies = res.headers["set-cookie"][0]
      .split(",")
      .map((item) => item.split(";")[0]);
    const cookie = cookies.join(";");
    return cookie;
  } else {
    return null;
  }
};
