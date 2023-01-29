const {
  exampleChecklistMarkup,
  ChecklistDataSchema,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/Checklist");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Checklist fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleChecklistMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed checklist fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed checklist fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed checklist fragment uses the expected data schema", () => {
    const validator = () => {
      ChecklistDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
