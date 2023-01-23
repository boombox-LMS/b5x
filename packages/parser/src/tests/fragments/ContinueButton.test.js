const {
  exampleContinueButtonMarkup,
} = require("../../../dist/componentBuilders/fragments/ContinueButton");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The ContinueButton fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleContinueButtonMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed continue-button fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed continue-button fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed continue-button fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
