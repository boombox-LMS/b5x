const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.detachLeadingTrailingParens is working as expected", () => {
  test("detachLeadingTrailingParens detects open and closing parens", () => {
    const items = ["(reader-mood", "is", "good)"];
    const expectedResult = ["(", "reader-mood", "is", "good", ")"];
    const result = ConditionsHelper.detachLeadingTrailingParens(items);

    expect(_.isEqual(result, expectedResult)).toBe(true);
  });
});
