const {
  exampleSentimentCheckMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/SentimentCheck");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The SentimentCheck fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleSentimentCheckMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed sentiment-check fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed sentiment-check fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed sentiment-check fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
