const {
  exampleEchoMarkup,
  EchoDataSchema,
} = require("../../../dist/parser/componentBuilders/fragments/Echo");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Echo fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleEchoMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed echo fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed echo fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed echo fragment uses the expected data schema", () => {
    const validator = () => {
      EchoDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
