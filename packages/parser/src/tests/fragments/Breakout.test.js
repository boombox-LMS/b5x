const {
  exampleBreakoutMarkupOne,
  exampleBreakoutMarkupTwo,
  exampleBreakoutMarkupThree,
} = require("../../../dist/componentBuilders/fragments/Breakout");
const { RawFragmentSchema } = require("@b5x/types");

describe("The simple breakout fragment builds as expected", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleBreakoutMarkupOne
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed simple breakout fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed simple breakout fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});

describe("The breakout fragment builds as expected when it includes an icon", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleBreakoutMarkupTwo
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed breakout fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed breakout fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});

describe("The breakout fragment builds as expected when it includes all attributes", () => {
  const fragment = global.buildFragmentFromMarkupString(
    exampleBreakoutMarkupThree
  );
  const rawFragment = fragment.packageForApi();

  test("The parsed breakout fragment matches the snapshot on file", () => {
    expect(rawFragment).toMatchSnapshot();
  });

  test("The parsed breakout fragment is a valid RawFragment", () => {
    const validator = () => {
      RawFragmentSchema.parse(rawFragment);
    };
    expect(validator).not.toThrowError();
  });
});
