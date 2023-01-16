const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.isSingleConditionStr is working as expected", () => {
  test("A single condition str should get a result of true", () => {
    const formattedExpression = "reader-mood is bad";
    const result = ConditionsHelper.isSingleConditionStr({
      formattedExpression,
    });
    expect(result).toBe(true);
  });

  test("A double condition str should get a result of false", () => {
    const formattedExpression =
      "(reader-mood is bad) and (favorite-color is blue)";
    const result = ConditionsHelper.isSingleConditionStr({
      formattedExpression,
    });
    expect(result).toBe(false);
  });
});
