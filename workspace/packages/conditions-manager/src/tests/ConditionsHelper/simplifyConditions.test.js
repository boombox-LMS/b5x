const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.simplifyConditions is working as expected", () => {
  test("simplifyConditions has no effect on non-arrays", () => {
    const nonArrays = ["and", "or", 9, "string", null];

    nonArrays.forEach((conditions) => {
      const result = ConditionsHelper.simplifyConditions(conditions);
      expect(_.isEqual(result, conditions)).toBe(true);
    });
  });

  test("simplifyConditions has no effect on already-simplified arrays", () => {
    const simpleArrays = [[1, 2, 3], ["a", "b", "c"], [], [1, 2, 3, [1, 2, 3]]];

    simpleArrays.forEach((conditions) => {
      const result = ConditionsHelper.simplifyConditions(conditions);
      expect(_.isEqual(result, conditions)).toBe(true);
    });
  });

  test("simplifyConditions removes extraneous enclosing arrays", () => {
    const testItems = [
      {
        conditions: [[]],
        expectedResult: [],
      },
      {
        conditions: [[[[[[]]]]]],
        expectedResult: [],
      },
      {
        conditions: [[1, 2, 3]],
        expectedResult: [1, 2, 3],
      },
      {
        conditions: [[1, 2, 3, [[1, 2, 3]]]],
        expectedResult: [1, 2, 3, [1, 2, 3]],
      },
    ];

    testItems.forEach((testItem) => {
      const { conditions, expectedResult } = testItem;
      const result = ConditionsHelper.simplifyConditions(conditions);
      expect(_.isEqual(result, expectedResult)).toBe(true);
    });
  });
});
