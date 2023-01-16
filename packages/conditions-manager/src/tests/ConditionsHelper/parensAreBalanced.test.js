const { ConditionsHelper } = require("../../../dist/index");

describe("ConditionsHelper.parensAreBalanced is working as expected", () => {
  test("Unbalanced expressions should return false", () => {
    const unbalancedExpressions = [
      ")",
      "(",
      "(xyz",
      "xyz)",
      "(x(yz)",
      "(x)(y)(z))",
    ];

    unbalancedExpressions.forEach((exp) => {
      const result = ConditionsHelper.parensAreBalanced(exp);
      expect(result).toBe(false);
    });
  });

  test("Balanced expressions should return true", () => {
    const balancedExpressions = [
      "",
      "()",
      "(xyz)",
      "(x(y)z)",
      "((x)(y)(z))",
      "((x )( y) (z))",
    ];

    balancedExpressions.forEach((exp) => {
      const result = ConditionsHelper.parensAreBalanced(exp);
      expect(result).toBe(true);
    });
  });
});
