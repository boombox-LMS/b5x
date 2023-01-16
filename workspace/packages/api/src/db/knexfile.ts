/**
 *  Database connection settings
 */

require("dotenv").config({ path: __dirname + `/../../.env` });

module.exports = {
  // AWKWARD: There isn't really a persistent test database,
  // since test files run asynchronously
  // and thus require their own temporary databases.
  test: {
    client: process.env.DB_CLIENT,
    connection: {
      database: process.env.TEST_DB_NAME,
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
    },
    pool: { min: 0, max: 10 },
  },

  development: {
    client: process.env.DB_CLIENT,
    connection: {
      database: process.env.DEV_DB_NAME,
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
    },
  },

  production: {
    client: "NA",
    connection: {
      database: "NA",
      user: "NA",
      password: "NA",
    },
  },
};
