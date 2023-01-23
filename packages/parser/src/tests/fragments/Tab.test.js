const {
  exampleTabMarkup,
} = require("../../../dist/componentBuilders/fragments/Tab");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Tab fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleTabMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed tab fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed tab fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
