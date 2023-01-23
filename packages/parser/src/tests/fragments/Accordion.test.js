const {
  exampleAccordionMarkup,
} = require("../../../dist/componentBuilders/fragments/Accordion");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Accordion fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleAccordionMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed accordion fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed accordion fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
