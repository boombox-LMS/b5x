const {
  exampleWarningMarkup,
} = require("../../../dist/parser/componentBuilders/fragments/Warning");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Warning fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleWarningMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed warning fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed warning fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
