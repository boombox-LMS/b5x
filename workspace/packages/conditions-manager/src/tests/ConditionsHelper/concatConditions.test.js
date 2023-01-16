const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.concatConditions is working as expected", () => {
  test("concatConditions can add two empty conditions sets", () => {
    const oldConditions = [];
    const newConditions = [];
    const result = ConditionsHelper.concatConditions(
      oldConditions,
      newConditions
    );
    expect(_.isEqual(result, [])).toBe(true);
  });

  test("concatConditions can add two populated conditions sets", () => {
    const oldConditions = [
      {
        type: "condition",
        data: { uri: "reader-role", operator: "is", targetValue: "designer" },
      },
    ];
    const newConditions = [
      {
        type: "condition",
        data: {
          uri: "reader-location",
          operator: "is",
          targetValue: "Seattle",
        },
      },
    ];
    const expectedResult = [
      [
        {
          type: "condition",
          data: { uri: "reader-role", operator: "is", targetValue: "designer" },
        },
      ],
      { type: "conjunction", data: "and" },
      [
        {
          type: "condition",
          data: {
            uri: "reader-location",
            operator: "is",
            targetValue: "Seattle",
          },
        },
      ],
    ];
    const result = ConditionsHelper.concatConditions(
      oldConditions,
      newConditions
    );
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });

  test("concatConditions can add one unpopulated set and one populated set", () => {
    const oldConditions = [];
    const newConditions = [
      {
        type: "condition",
        data: {
          uri: "reader-location",
          operator: "is",
          targetValue: "Seattle",
        },
      },
    ];
    const expectedResult = newConditions;
    const result = ConditionsHelper.concatConditions(
      oldConditions,
      newConditions
    );
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });

  test("concatConditions can add one populated set and one unpopulated set", () => {
    const oldConditions = [
      {
        type: "condition",
        data: { uri: "reader-role", operator: "is", targetValue: "designer" },
      },
    ];
    const newConditions = [];
    const expectedResult = oldConditions;
    const result = ConditionsHelper.concatConditions(
      oldConditions,
      newConditions
    );
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });
});
