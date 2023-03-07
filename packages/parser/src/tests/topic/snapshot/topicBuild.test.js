const { Topic } = require(`${global.DIST_PATH}/componentBuilders/Topic`);

describe("The parsed topics match their snapshots", () => {
  test("The parsed smoke test topic JSON matches the snapshot", () => {
    const parsedTopicJson = new Topic({
      slug: "smoke-testing",
      version: "test",
      dir: global.EXAMPLE_TOPICS_DIR + "/smoke-testing",
    }).packageForApi();

    expect(parsedTopicJson).toMatchSnapshot();
  });

  test("The parsed component catalog JSON matches the snapshot", () => {
    const parsedTopicJson = new Topic({
      slug: "boombox-feature-utopia",
      version: "test",
      dir: global.EXAMPLE_TOPICS_DIR + "/boombox-feature-utopia",
    }).packageForApi();

    expect(parsedTopicJson).toMatchSnapshot();
  });
});
