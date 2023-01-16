const {
  exampleMermaidDiagramMarkup,
  MermaidDiagramDataSchema,
} = require("../../../dist/parser/componentBuilders/fragments/MermaidDiagram");
const { RawFragmentSchema } = require("@b5x/types");

describe("The MermaidDiagram fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleMermaidDiagramMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed mermaid-diagram fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed mermaid-diagram fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed mermaid-diagram fragment uses the expected data schema", () => {
    const validator = () => {
      MermaidDiagramDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
