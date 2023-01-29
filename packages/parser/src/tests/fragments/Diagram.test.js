const {
  exampleDiagramMarkup,
  DiagramDataSchema,
} = require("../../../dist/componentBuilders/fragments/parsingClasses/Diagram");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Diagram fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleDiagramMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed diagram fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed diagram fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed diagram fragment uses the expected data schema", () => {
    const validator = () => {
      DiagramDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
