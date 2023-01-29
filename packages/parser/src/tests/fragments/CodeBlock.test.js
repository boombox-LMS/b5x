const {
  exampleCodeBlockMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/CodeBlock");
const { RawFragmentSchema } = require("@b5x/types");

describe("The CodeBlock fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleCodeBlockMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed code-block fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });
  test("The parsed code-block fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
