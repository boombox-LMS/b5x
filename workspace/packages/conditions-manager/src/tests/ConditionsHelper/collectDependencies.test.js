const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.collectDependencies is working as expected", () => {
  test("collectDependencies returns the URIs from a conditions list", () => {
    const conditions = [
      [
        [
          {
            type: "condition",
            data: { uri: "reader-mood", operator: "is", targetValue: "good" },
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
      ],
      { type: "conjunction", data: "and" },
      [
        {
          type: "condition",
          data: {
            uri: "reader-role",
            operator: "is_not",
            targetValue: "designer",
          },
        },
      ],
    ];

    const expectedResult = ["reader-mood", "reader-location", "reader-role"];
    const result = ConditionsHelper.collectDependencies({ conditions });

    expect(_.isEqual(result, expectedResult)).toBe(true);
  });
});
