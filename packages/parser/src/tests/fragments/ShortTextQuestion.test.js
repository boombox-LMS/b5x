const {
  exampleShortTextQuestionMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/ShortTextQuestion");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The ShortTextQuestion fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleShortTextQuestionMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed short-text-question fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed short-text-question fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed short-text-question fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
