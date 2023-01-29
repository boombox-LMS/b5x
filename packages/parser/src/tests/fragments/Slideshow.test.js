const {
  exampleSlideshowMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/Slideshow");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Slideshow fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleSlideshowMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed slideshow fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed slideshow fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
