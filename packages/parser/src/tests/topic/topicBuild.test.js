const { Topic } = require("../../../dist/componentBuilders/Topic");
const path = require("path");
const exampleTopicDir = path.resolve(
  __dirname,
  "../../../example-topics/smoke-testing"
);
const { RawTopicSchema } = require("@b5x/types");

describe("The smoke test topic matches expectations", () => {
  const parsedTopicJson = new Topic({
    slug: "smoke-testing",
    version: "test",
    dir: exampleTopicDir,
  }).packageForApi();

  test("The parsed topic JSON matches the snapshot", () => {
    expect(parsedTopicJson).toMatchSnapshot();
  });

  test("The parsed topic JSON is the correct data type", () => {
    const validator = () => {
      RawTopicSchema.parse(parsedTopicJson.topic);
    };
    expect(validator).not.toThrowError();
  });
});

describe("The component catalog topic matches expectations", () => {
  const parsedTopicJson = new Topic({
    slug: "boombox-feature-utopia",
    version: "test",
    dir: exampleTopicDir,
  }).packageForApi();

  test("The parsed topic JSON matches the snapshot", () => {
    expect(parsedTopicJson).toMatchSnapshot();
  });

  test("The parsed topic JSON is the correct data type", () => {
    const validator = () => {
      RawTopicSchema.parse(parsedTopicJson.topic);
    };
    expect(validator).not.toThrowError();
  });
});
