const {
  exampleStepMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/Step");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Step fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleStepMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed step fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed step fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
