const {
  exampleShowMarkup,
} = require("../../../dist/componentBuilders/fragments/Show");
const { RawFragmentSchema, DraftConditionsListSchema } = require("@b5x/types");

describe("The Show fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleShowMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed show fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });
  test("The parsed show fragment is a valid RawFragment", () => {
    // Because the topic is responsible for revising draft conditions
    // to final conditions, an individually built show fragment
    // will still have a draft conditions list instead of a finalized conditions list.
    // TODO: This means that the Show fragment does not return the RawFragment
    // type that it is said to return via the abstract fragment class ... revise?
    // Pass the packageForApi() function a set of uris to fill in with?
    // Some other approach?
    const RawFragmentWithDraftConditionsSchema = RawFragmentSchema.omit({
      displayConditions: true,
    }).extend({
      displayConditions: DraftConditionsListSchema,
    });
    const validator = () => {
      RawFragmentWithDraftConditionsSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
