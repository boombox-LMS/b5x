require("dotenv").config({ path: "../../../.env" });
const { DatabaseConnectionBuilder } = require("../DatabaseConnectionBuilder");
const { BoomboxDataManager } = require("../manager/BoomboxDataManager");

const seed = (async () => {
  const dbConnectionBuilder = new DatabaseConnectionBuilder("development"); // TODO: Avoid hardcoding env?
  const knex = await dbConnectionBuilder
    .createKnexConnection()
    .catch((e: any) => {
      throw e;
    });
  const db = new BoomboxDataManager(knex);
  await db.seeder.seed({ users: "default" }).catch((e: any) => {
    throw e;
  });
  // TODO: Make the closing of queues part of the destroy() function?
  await db.events.creationQueue.close().catch((e: any) => {
    throw e;
  });
  await db.destroy().catch((e: any) => {
    throw e;
  });
})();
