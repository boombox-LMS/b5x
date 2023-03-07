const { Topic } = require(`${global.DIST_PATH}/componentBuilders/Topic`);
const { RawTopicSchema } = require("@b5x/types");

describe("The parsed topics have the correct data types", () => {
  test("The parsed smoke test topic JSON is the correct data type", () => {
    const parsedTopicJson = new Topic({
      slug: "smoke-testing",
      version: "test",
      dir: global.EXAMPLE_TOPICS_DIR + "/smoke-testing",
    }).packageForApi();

    const validator = () => {
      RawTopicSchema.parse(parsedTopicJson.topic);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed component catalog topic JSON is the correct data type", () => {
    const parsedTopicJson = new Topic({
      slug: "boombox-feature-utopia",
      version: "test",
      dir: global.EXAMPLE_TOPICS_DIR + "/boombox-feature-utopia",
    }).packageForApi();

    const validator = () => {
      RawTopicSchema.parse(parsedTopicJson.topic);
    };
    expect(validator).not.toThrowError();
  });
});
