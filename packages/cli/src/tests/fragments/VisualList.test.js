const {
  exampleVerticalVisualListMarkup,
  VisualListDataSchema,
} = require("../../../dist/parser/componentBuilders/fragments/VisualList");
const { RawFragmentSchema } = require("@b5x/types");

describe("The VisualList fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleVerticalVisualListMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed visual-list fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed visual-list fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed visual-list fragment uses the expected data schema", () => {
    const validator = () => {
      VisualListDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
