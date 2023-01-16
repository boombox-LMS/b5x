const {
  exampleTroubleshooterMarkup,
  TroubleshooterDataSchema,
} = require("../../../dist/parser/componentBuilders/fragments/Troubleshooter");
const { RawFragmentSchema } = require("@b5x/types");

describe("The Troubleshooter fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleTroubleshooterMarkup
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed troubleshooter fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed troubleshooter fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed troubleshooter fragment uses the expected data schema", () => {
    const validator = () => {
      TroubleshooterDataSchema.parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
