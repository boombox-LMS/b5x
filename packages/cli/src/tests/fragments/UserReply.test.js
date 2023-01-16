const {
  exampleUserReplyMarkup,
} = require("../../../dist/parser/componentBuilders/fragments/UserReply");
const { RawFragmentSchema } = require("@b5x/types");
const { z } = require("zod");

describe("The UserReply fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(exampleUserReplyMarkup);
  const rawFragment = fragment.packageForApi();

  test("The parsed user-reply fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed user-reply fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });

  test("The parsed user-reply fragment uses the expected data schema", () => {
    const validator = () => {
      z.object({}).parse(rawFragment.data);
    };
    expect(validator).not.toThrowError();
  });
});
