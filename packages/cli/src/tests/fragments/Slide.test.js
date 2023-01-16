const {
  exampleSlideMarkup,
} = require("../../../dist/parser/componentBuilders/fragments/Slide");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Slide fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleSlideMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed slide fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed slide fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
