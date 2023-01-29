const {
  exampleTabsMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/Tabs");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Tabs fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleTabsMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed tabs fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed tabs fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
