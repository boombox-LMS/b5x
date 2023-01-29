const {
  exampleSingleSelectQuestionMarkup,
  exampleMultiSelectQuestionMarkup,
  SelectQuestionDataSchema,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/SelectQuestion");
const { RawFragmentSchema } = require("@b5x/types");

describe("The SelectQuestion fragment returns the expected data for single-select questions", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleSingleSelectQuestionMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed single-select-question fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed single-select-question fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed single-select-question fragment uses the expected data schema", () => {
    const validator = () => {
      SelectQuestionDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});

describe("The SelectQuestion fragment returns the expected data for multi-select questions", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleMultiSelectQuestionMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed multi-select-question fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed multi-select-question fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed single-select-question fragment uses the expected data schema", () => {
    const validator = () => {
      SelectQuestionDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
