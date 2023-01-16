/**
 *  This will run once -- once total,
 *  not once per test/file/suite -- before Jest runs any tests.
 */

const globalSetup = () => {
  return true;
};

module.exports = globalSetup;
