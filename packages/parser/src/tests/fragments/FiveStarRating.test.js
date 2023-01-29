const {
  exampleFiveStarRatingMarkup,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/FiveStarRating");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The FiveStarRating fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleFiveStarRatingMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed five-star-rating fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed five-star-rating fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed five-star-rating fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
