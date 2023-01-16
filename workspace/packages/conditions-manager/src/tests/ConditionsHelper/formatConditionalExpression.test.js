const { ConditionsHelper } = require("../../../dist/index");

describe("ConditionsHelper.formatConditionalExpression is working as expected", () => {
  test("formatConditionalExpression result matches snapshot", () => {
    const rawConditions = `
      ((favorite-color    is  blue))

    `;
    const result = ConditionsHelper.formatConditionalExpression(rawConditions);
    expect(result).toBe("favorite-color is blue");
  });
});
