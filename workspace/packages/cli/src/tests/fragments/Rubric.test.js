const {
  exampleRubricMarkup,
  RubricDataSchema,
} = require("../../../dist/parser/componentBuilders/fragments/Rubric");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Rubric fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleRubricMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed rubric fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed rubric fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed rubric fragment uses the expected data schema", () => {
    const validator = () => {
      RubricDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
