const {
  exampleLongTextQuestionMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/LongTextQuestion");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The LongTextQuestion fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleLongTextQuestionMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed long-text-question fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed long-text-question fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed long-text-question fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
